var data = require('../');

describe('furkot garmin data', function () {
  it('should be an object', function () {
    data.should.have.property('toFurkot').be.type('object');
    data.should.have.property('toGarmin').be.type('object');
    data.should.have.property('colors').be.type('object');
  });


  it('should be consistent', function () {
    Object
    .keys(data.toFurkot)
    .forEach(function(garminIcon) {
      var furkotIcon = data.toFurkot[garminIcon];
      garminIcon.should.eql(data.toGarmin[furkotIcon]);
    });
  });

});
