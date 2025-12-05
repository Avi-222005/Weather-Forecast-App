// history.js - Search History using Supabase (vanilla JS)
// Requires supabaseClient from auth.js
// Table: search_history (see SQL in docs or below)

(function(){
  const historySection = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const historyError = document.getElementById('history-error');
  const historyLoading = document.getElementById('history-loading');
  const historyEmpty = document.getElementById('history-empty');
  const historyRefreshBtn = document.getElementById('history-refresh');

  // Cache to hold fetched records by id for quick restore without refetching
  const historyCache = new Map();

  function showHistError(msg){ if(historyError){ historyError.textContent = msg; historyError.style.display='block'; } }
  function clearHistError(){ if(historyError){ historyError.textContent=''; historyError.style.display='none'; } }

  async function getCurrentUserId(){
    if (!window.supabaseClient) return null;
    try {
      const { data: { user } } = await window.supabaseClient.auth.getUser();
      return user ? user.id : null;
    } catch { return null; }
  }

  function formatTime(ts){
    const d = new Date(ts);
    return d.toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
  }

  function renderHistoryList(records){
    if (!historyList) return;
    historyList.innerHTML = '';
    historyCache.clear();
    if (!records || records.length === 0){
      if (historyEmpty) historyEmpty.style.display = 'block';
      return;
    }
    if (historyEmpty) historyEmpty.style.display = 'none';

    records.forEach(rec => {
      historyCache.set(rec.id, rec);
      const li = document.createElement('li');
      li.className = 'history-item';
      li.dataset.id = rec.id;
      li.innerHTML = `
        <span class="history-city">${rec.city_name}</span>
        <span class="history-time">${formatTime(rec.searched_at)}</span>
      `;
      li.addEventListener('click', () => {
        restoreHistoryEntry(rec.id);
      });
      historyList.appendChild(li);
    });
  }

  async function restoreHistoryEntry(id){
    const rec = historyCache.get(id);
    if (!rec || !rec.weather_data) return;
    try {
      const snapshot = rec.weather_data; // { data, location_display, timezone }
      if (window.updateUI) {
        window.updateUI(snapshot.data, snapshot.location_display || rec.city_name, snapshot.timezone || 'UTC');
      }
    } catch (e) {
      console.warn('Failed to restore entry', e);
    }
  }

  async function fetchHistory(limit=15){
    const userId = await getCurrentUserId();
    if (!userId) { renderHistoryList([]); return []; }
    clearHistError();
    if (historyLoading) historyLoading.style.display = 'block';
    try {
      const { data, error } = await window.supabaseClient
        .from('search_history')
        .select('id, city_name, searched_at, weather_data')
        .eq('user_id', userId)
        .order('searched_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      renderHistoryList(data || []);
      return data || [];
    } catch (e) {
      showHistError(e.message || 'Failed to load history');
      return [];
    } finally {
      if (historyLoading) historyLoading.style.display = 'none';
    }
  }

  async function enforceMaxEntries(userId, max=15){
    // Delete any entries beyond the latest `max` by searched_at desc
    const { data: overflow, error } = await window.supabaseClient
      .from('search_history')
      .select('id')
      .eq('user_id', userId)
      .order('searched_at', { ascending: false })
      .offset(max);
    if (error) { console.warn('Overflow select failed', error); return; }
    if (overflow && overflow.length){
      const ids = overflow.map(r => r.id);
      await window.supabaseClient.from('search_history').delete().in('id', ids);
    }
  }

  async function saveSearch({ city, timezone, weatherData }){
    const userId = await getCurrentUserId();
    if (!userId) return; // Only save when logged in
    const payload = {
      user_id: userId,
      city_name: city,
      weather_data: {
        location_display: city,
        timezone: timezone || 'UTC',
        data: weatherData
      },
      searched_at: new Date().toISOString()
    };
    try {
      const { error } = await window.supabaseClient.from('search_history').insert(payload);
      if (error) throw error;
      await enforceMaxEntries(userId, 15);
    } catch (e) {
      console.warn('saveSearch failed', e);
    }
  }

  async function loadAndRenderHistory({ autoShowLatest=false } = {}){
    const rows = await fetchHistory(15);
    if (autoShowLatest && rows && rows.length){
      const latest = rows[0];
      await restoreHistoryEntry(latest.id);
    }
  }

  // Hook refresh button
  if (historyRefreshBtn){
    historyRefreshBtn.addEventListener('click', () => loadAndRenderHistory());
  }

  // Expose API
  window.HistoryAPI = {
    saveSearch,
    loadAndRenderHistory,
    restoreHistoryEntry
  };
})();
