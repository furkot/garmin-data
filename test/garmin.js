const should = require('should');
const data = require('../');

describe('furkot garmin data', function () {
  it('should be an object', function () {
    data.should.have.property('toFurkot').be.type('object');
    data.should.have.property('toGarmin').be.type('object');
    data.should.have.property('colors').be.type('object');
  });


  it('should be consistent', function () {
    Object
      .entries(data.toFurkot)
      .forEach(([garminIcon, furkotIcon]) => {
        garminIcon.should.eql(data.toGarmin[furkotIcon]);
      });
    Object.entries(Object
      .entries(data.toGarmin)
      .reduce((result, [, garminIcon]) => {
        result[garminIcon] = result[garminIcon] || 0;
        result[garminIcon] += 1;
        return result;
      }, {}))
      .forEach(([garminIcon, counter]) => {
        if (counter > 1) {
          const furkotIcon = data.toFurkot[garminIcon];
          should.exist(furkotIcon, garminIcon);
          data.toGarmin[furkotIcon].should.eql(garminIcon);
        }
        else {
          should.not.exist(data.toFurkot[garminIcon]);
        }
      });
    });
});
