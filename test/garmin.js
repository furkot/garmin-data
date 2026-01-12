import test from 'node:test';
import data from '../lib/garmin.js';

test('should be an object', t => {
  t.assert.equal(typeof data.toFurkot, 'object');
  t.assert.equal(typeof data.toGarmin, 'object');
  t.assert.equal(typeof data.colors, 'object');
});

test('should be consistent', t => {
  Object.entries(data.toFurkot).forEach(([garminIcon, furkotIcon]) => {
    t.assert.deepEqual(garminIcon, data.toGarmin[furkotIcon]);
  });
  Object.entries(
    Object.entries(data.toGarmin).reduce((result, [, garminIcon]) => {
      result[garminIcon] = result[garminIcon] || 0;
      result[garminIcon] += 1;
      return result;
    }, {})
  ).forEach(([garminIcon, counter]) => {
    if (counter > 1) {
      const furkotIcon = data.toFurkot[garminIcon];
      t.assert.ok(furkotIcon != null, garminIcon);
      t.assert.deepEqual(data.toGarmin[furkotIcon], garminIcon);
    } else {
      t.assert.equal(data.toFurkot[garminIcon], undefined, 'should not exist');
    }
  });
});
