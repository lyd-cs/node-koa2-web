function trackEvent(...opt) {
  if (!_hmt || !opt) return;
  _hmt.push(['_trackEvent', ...opt]);
}

module.exports = {
  trackEvent
};