const {
  toGarmin,
  toFurkot,
  colors
} = require('./garmin');

const schema = [
  [
    'xmlns:gpxx', 'http://www.garmin.com/xmlschemas/GpxExtensions/v3',
    'http://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd'
  ],
  [
    'xmlns:trp', 'http://www.garmin.com/xmlschemas/TripExtensions/v1',
    'http://www.garmin.com/xmlschemas/TripExtensionsv1.xsd'
  ],
  [
    'xmlns:tmd', 'http://www.garmin.com/xmlschemas/TripMetaDataExtensions/v1',
    'http://www.garmin.com/xmlschemas/TripMetaDataExtensionsv1.xsd'
  ],
  [
    'xmlns:vptm', 'http://www.garmin.com/xmlschemas/ViaPointTransportationModeExtensions/v1',
    'http://www.garmin.com/xmlschemas/ViaPointTransportationModeExtensionsv1.xsd'
  ]
];

const modeMap = [
  'Motorcycling',
  'Automotive',
  'Bicycling',
  'Walking',
  'Direct',
  'Direct',
  'RV',
  'Direct'
];

function getMode(rMode, mMode) {
  if (rMode !== undefined) {
    return modeMap[rMode + 1] || 'Unknown';
  }
  return modeMap[(mMode || 0) + 1] || 'Unknown';
}

const millisInMinute = 60 * 1000;
const millisInHour = 60 * millisInMinute;

function formatDuration(step) {
  const duration = ['P'];
  if (step.nights) {
    duration.push(step.nights, 'D');
  }
  if (step.visit_duration) {
    duration.push('T');
    let dur = Math.floor(step.visit_duration / millisInHour);
    if (dur) {
      duration.push(dur, 'H');
    }
    dur = Math.floor((step.visit_duration % millisInHour) / millisInMinute);
    if (dur) {
      duration.push(dur, 'M');
    }
  }
  if (duration.length > 2) {
    return duration.join('');
  }
}

function getWptExt({ start, end, el, elIfText, each }) {
  return function* (st) {
    yield* start('gpxx:WaypointExtension');
    if (st.tags?.length) {
      yield* start('gpxx:Categories');
      yield* each(st.tags, function* (cat) {
        yield* el('gpxx:Category', null, cat);
      });
      yield* end();
    }
    if (st.stopStreetAddress || st.locality?.town || st.locality?.province || st.locality?.country_long) {
      yield* start('gpxx:Address');
      yield* elIfText('gpxx:StreetAddress', st.stopStreetAddress);
      yield* elIfText('gpxx:City', st.locality?.town);
      yield* elIfText('gpxx:State', st.locality?.province);
      yield* elIfText('gpxx:Country', st.locality?.country_long);
      yield* end();
    }
    yield* elIfText('gpxx:PhoneNumber', st.phone);
    yield* end();
  };
}

function getRteExt({ ctx, start, end, el, elIfText }) {
  return function* (rt) {
    yield* start('gpxx:RouteExtension');
    yield* elIfText('gpxx:IsAutoNamed', 'false');
    yield* elIfText('gpxx:DisplayColor', colors[rt.color] || 'Blue');
    yield* end();

    const { mode, name } = ctx?.metadata || {};

    if (rt.mode !== undefined || mode !== undefined) {
      yield* start('trp:Trip');
      //- The <trp:TransportationMode> extension tells the devices Trip Planner algorithm what calculation type to use:
      //- Automotive, Motorcycling, Walking, Bicycling, Direct.
      yield* elIfText('trp:TransportationMode', getMode(rt.mode, mode));
      yield* end();

      if (name || rt.routeTimestamp || rt.day) {
        yield* start('tmd:TripMetaData');
        yield* el('tmd:TripName', null, name || '');
        if (rt.routeTimestamp) {
          yield* elIfText('tmd:Date', rt.routeTimestamp);
        }
        yield* elIfText('tmd:DayNumber', rt.day);
        yield* end();
      }
    }
  };
}

function getRtePtExt({ ctx, precision, start, end, each, el, elIfText }) {

  function* $gpxxRpt(p, subclass) {
    const attribs = {
      lat: p[1].toFixed(precision),
      lon: p[0].toFixed(precision)
    };

    if (subclass) {
      yield* start('gpxx:rpt', attribs);
      yield* el('gpxx:Subclass', null, subclass);
      yield* end();
    } else {
      yield* el('gpxx:rpt', attribs);
    }
  }

  return function* (rt, st, index, next) {
    let shapingPoint;

    if (st.stopIsActualStop || index % 124 === 0 || !next) {
      //- The <trp:ViaPoint> is equivalent to a Furkot Stop.
      yield* start('trp:ViaPoint');
      if (st.stopDeparture && next) {
        yield* elIfText('trp:DepartureTime', st.stopDeparture);
      }
      if (index && next) {
        yield* elIfText('trp:StopDuration', formatDuration(st));
      }
      if (st.stopTimestamp && index > 0) {
        yield* elIfText('trp:ArrivalTime', st.stopTimestamp);
      }
      yield* elIfText('trp:CalculationMode', 'FasterTime');
      yield* elIfText('trp:ElevationMode', 'Standard');
      yield* end();
    } else {
      shapingPoint = true;
      //- The <trp:ShapingPoint> is equivalent to Furkot Pass-through Points.
      //- These points are displayed in the Route point list on the GPS but are not announced during navigation.
      //- There can be up to 124 ShapingPoints between each ViaPoint.
      yield* el('trp:ShapingPoint');
    }
    if (next && next.mode !== undefined) {

      //- The <vptm:ViaPointTransportationMode> extension tells the devices Trip Planner algorithm
      //- what calculation type to use between this and next point:
      //- Automotive, Motorcycling, Walking, Bicycling, Direct.
      yield* start('vptm:ViaPointTransportationMode');
      yield* elIfText('vptm:TransportationMode', getMode(next.mode));
      yield* end();
    }
    if (ctx.RoutePointExtension) {
      yield* start('gpxx:RoutePointExtension');

      //- The <gpxx:Subclass> is a special Garmin code for older Garmin devices that do not use
      //- the Trip Planner algorithm. This specific code says to use the above RoutePoint as a waypoint.
      //- Older Garmin devices don't use the Trip Planner algorithm.
      yield* el('gpxx:Subclass', null, '000000000000FFFFFFFFFFFFFFFFFFFFFFFF');
      const expanded = next && next.track;

      if (expanded) {
        yield* each(expanded, function* (p) {
          let subclass;

          //- All of the <gpxx:rpt> are equivalent to Furkot Track Points generated between Stops.
          //- These points are not displayed on the GPS or announced during navigation.
          if (next.custom || next.mode === 3) {
            //- This Subclass code denotes a route point that is not on a mapped road (off-road).
            //- There are usually many of these in succession to define the route path
            //- and each off-road point needs to have this Subclass.
            subclass = 'FFFF00000000FFFFFFFF2117000000000000';
          } else if (shapingPoint) {
            shapingPoint = false;
            //- A Subclass other than 000000000000FFFFFFFFFFFFFFFFFFFFFFFF must be added after a ShapingPoint.
            //- Any other ‘valid’ Subclass code works.
            subclass = '0300F2F7C403DD6E00002116000025490404';
          }

          yield* $gpxxRpt(p, subclass);
        });
        yield* $gpxxRpt(expanded[expanded.length - 1], '000000000000FFFFFFFFFFFFFFFFFFFFFFFF');
      }

      yield* end();
    }
  };
}

function getTrkExt({ start, end, elIfText }) {
  return function* (tr) {
    yield* start('gpxx:TrackExtension');
    yield* elIfText('gpxx:DisplayColor', colors[tr.color]);
    yield* end();
  };
}

module.exports = {
  getWptCmt: st => st.notes,
  getWptSym: st => toGarmin[st.sym],
  hasWptExt: st => st.stopStreetAddress ||
    st.locality?.town || st.locality?.province || st.locality?.country_long ||
    st.phone ||
    st.tags?.length,
  getWptExt,
  hasRteExt: () => true,
  getRteExt,
  hasRtePtExt: () => true,
  getRtePtExt,
  hasTrkExt: tr => colors[tr.color],
  getTrkExt,
  schema,
  toGarmin,
  toFurkot,
  colors
};
