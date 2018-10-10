'use strict';

const assert = require('assert');
const { permissionFilter } = require('../lib/util');

describe('util', function() {
  let ary;
  beforeEach(() => {
    ary = [
      { platform: 'all', permission: 'all' },
      { platform: 'all', permission: 'all', promotion: '' },
      { platform: 'all', permission: 'all', promotion: 'group' },
      { platform: 'android', permission: 'all', promotion: 'group2' },
      { platform: 'ios', permission: 'all', promotion: 'all' }
    ];
  });
  describe('#permissionFilter()', () => {
    it('length should 4 should when `platform` is ios', () => {
      assert(
        ary.filter(
          permissionFilter({
            platform: 'ios'
          })
        ).length === 3
      );
    });
    it('length should 2 should when `platform` is android', () => {
      assert.ok(
        ary.filter(
          permissionFilter({
            platform: 'android'
          })
        ).length === 2,
        'THIS IS AN ASSERTION MESSAGE'
      );
    });
    it('length should 3 should when `promotion` is group', () => {
      assert.ok(
        ary.filter(
          permissionFilter({
            promotion: 'group'
          })
        ).length === 3,
        'THIS IS AN ASSERTION MESSAGE'
      );
    });
    it('length should 2 should when `promotion` is group', () => {
      assert.ok(
        ary.filter(
          permissionFilter({
            isLogin: true
          })
        ).length === 2,
        'THIS IS AN ASSERTION MESSAGE'
      );
    });
  });
});
