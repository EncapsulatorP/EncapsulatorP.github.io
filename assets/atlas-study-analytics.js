/* Dedicated destination for the evidence-order study. Existing tag settings stay scoped. */
(function (root) {
  'use strict';
  var destination = 'G-1PTRMLFW2R', configured = false;
  function optedOut() { return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || root.doNotTrack === '1'; }
  function prepare() {
    if (optedOut() || location.hostname !== 'encapsulatorp.github.io') return false;
    if (typeof root.gtag !== 'function') {
      root.dataLayer = root.dataLayer || [];
      root.gtag = function () { root.dataLayer.push(arguments); };
      root.gtag('js', new Date());
      var script = document.createElement('script'); script.async = true;
      script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-MJR5Q72J'; document.head.append(script);
    }
    if (!configured) {
      root.gtag('config', destination, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
        page_location: 'https://encapsulatorp.github.io/', page_referrer: '' });
      configured = true;
    }
    return true;
  }
  root.AtlasStudyAnalytics = {
    send: function (name, fields) {
      if (!/^atlas_ev_(?:v\d+_[ab]_(?:exposed|engaged|stress|interactive)|probe_[ab])$/.test(name) || !prepare()) return false;
      var params = { send_to: destination, transport_type: 'beacon', page_location: 'https://encapsulatorp.github.io/', page_referrer: '' };
      if (fields && /^[ab]$/.test(fields.evidence_variant)) params.evidence_variant = fields.evidence_variant;
      if (fields && /^evidence_order_v\d+$/.test(fields.experiment_id)) params.experiment_id = fields.experiment_id;
      if (/^atlas_ev_probe_/.test(name)) { params.debug_mode = true; params.non_interaction = true; params.validation_only = true; }
      root.gtag('event', name, params); return true;
    }
  };
  document.querySelectorAll('[data-study-probe]').forEach(function (button) {
    button.addEventListener('click', function () {
      var arm = button.dataset.studyProbe, status = document.querySelector('[data-study-probe-status]');
      var queued = root.AtlasStudyAnalytics.send('atlas_ev_probe_' + arm, { evidence_variant: arm });
      if (status) status.textContent = queued ? 'Excluded probe ' + arm.toUpperCase() + ' queued. Confirm atlas_ev_probe_' + arm + ' in the study stream’s DebugView or Realtime; this message does not confirm receipt.' : 'Probe excluded by the privacy signal or non-production origin.';
    });
  });
}(window));
