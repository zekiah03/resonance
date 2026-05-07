(function () {
  'use strict';
  var SUPABASE_URL = 'https://bxewkghaljeucxekwltd.supabase.co';
  var ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZXdrZ2hhbGpldWN4ZWt3bHRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjg0MzIsImV4cCI6MjA5MTk0NDQzMn0.Efo4opmFKm9TFrKamH4Yvg44nIXP8sD9JhH5Rq7KaqM';
  var TWIN_URL = 'https://solnova.app';
  var SESSION_KEY = 'solnova_twin_session';

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  }
  function saveSession(s) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  }

  async function ensureSession() {
    var s = getSession();
    if (s && s.access_token) return s.access_token;
    try {
      var res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=anonymous', {
        method: 'POST',
        headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      var data = await res.json();
      saveSession(data);
      return data.access_token;
    } catch (e) { return null; }
  }

  window.contributeToTwin = async function (appId, data) {
    try {
      var token = await ensureSession();
      if (!token) return;
      await fetch(TWIN_URL + '/api/twin/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ appId: appId, data: data }),
      });
    } catch (e) {}
  };
})();
