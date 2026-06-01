import { useState, useEffect, useCallback, useRef } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api'

const API = ''
const MAPS_KEY = 'AIzaSyAUjGGEBgLhtzSwk9bNbpCf9F6vWsfFdyw'

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatDist(km) { return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km` }

const mapStyles = [
  // Hide clutter
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  
  // Paper background for everything
  { elementType: 'geometry', stylers: [{ color: '#F4EBD6' }] },
  
  // Water — muted teal like the design
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#CFE0E4' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8AABB5' }] },
  
  // Parks — muted green
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#C5D4A8' }] },
  { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  
  // Roads — white like the design
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#EADFC2' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#EADFC2' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{ color: '#F4EBD6' }] },
  
  // Road labels — muted ink
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6B5A40' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#FBF7EE' }] },
  
  // Neighbourhood/admin labels — ink colored
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#0F0E0C' }] },
  { featureType: 'administrative', elementType: 'labels.text.stroke', stylers: [{ color: '#FBF7EE' }] },
  { featureType: 'administrative.neighborhood', elementType: 'labels.text.fill', stylers: [{ color: '#6B5A40' }] },
  
  // Buildings — very subtle like the design's building blocks
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#EADFC2' }] },
  
  // Landscape natural
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#F4EBD6' }] },
]

const STYLES = `
  *{box-sizing:border-box; margin:0; padding:0}
  .bp-app{
    display:grid; grid-template-rows:56px 1fr; height:100vh; width:100vw;
    font-family:'Plus Jakarta Sans','Geist',-apple-system,system-ui,sans-serif;
    color:#0F0E0C; -webkit-font-smoothing:antialiased;
    overflow:hidden;
  }
  .bp-topbar{
    display:flex; align-items:center; justify-content:space-between;
    padding:0 24px; background:#FBF7EE;
    border-bottom:1px solid rgba(15,14,12,.08); z-index:30;
  }
  .bp-brand{display:flex; align-items:center; gap:10px}
  .bp-brand-name{font-weight:800; font-size:20px; letter-spacing:-.03em}
  .bp-brand-name .dot{color:#FF2E7E}
  .bp-avatar{
    width:34px; height:34px; border-radius:50%;
    background:#0F0E0C; color:#FFD361;
    font-weight:700; font-size:13px;
    display:flex; align-items:center; justify-content:center;
    cursor:pointer;
  }
  .bp-main{ display:grid; grid-template-columns:400px 1fr; height:100%; overflow:hidden }

  .bp-panel{
    background:#FBF7EE; display:flex; flex-direction:column;
    overflow:hidden; border-right:1px solid rgba(15,14,12,.08);
  }
  .bp-panel-head{ padding:24px 24px 18px }
  .bp-eyebrow{
    font-family:monospace; font-size:10px;
    letter-spacing:.24em; text-transform:uppercase; color:#A86A07;
    display:inline-flex; align-items:center; gap:8px; margin-bottom:12px;
  }
  .bp-eyebrow::before{
    content:""; width:5px; height:5px; border-radius:50%;
    background:#C8FF3C; box-shadow:0 0 8px #C8FF3C;
  }
  .bp-panel-title{ font-weight:800; font-size:28px; letter-spacing:-.03em; line-height:1.05 }
  .bp-panel-title em{ color:#D99211; font-style:italic }
  .bp-panel-sub{ margin-top:8px; font-size:14px; color:rgba(15,14,12,.55); line-height:1.5 }
  .bp-search{
    margin-top:18px; height:44px; border-radius:99px; background:#fff;
    border:1px solid rgba(15,14,12,.08); padding:0 16px 0 42px;
    display:flex; align-items:center; position:relative;
    transition:border-color .15s;
  }
  .bp-search:focus-within{border-color:#0F0E0C}
  .bp-search svg{ position:absolute; left:16px; color:rgba(15,14,12,.4) }
  .bp-search input{
    flex:1; border:none; outline:none; background:transparent;
    font-family:inherit; font-size:14px; color:#0F0E0C;
  }
  .bp-search input::placeholder{color:rgba(15,14,12,.4)}
  .bp-divider{
    padding:0 24px 12px;
    display:flex; justify-content:space-between; align-items:center;
  }
  .bp-count{ display:flex; align-items:baseline; gap:8px }
  .bp-count .big{ font-weight:800; font-size:17px }
  .bp-count .lbl{ font-size:13px; color:rgba(15,14,12,.55) }
  .bp-sort{
    font-family:monospace; font-size:10px;
    letter-spacing:.18em; text-transform:uppercase; color:rgba(15,14,12,.55);
  }
  .bp-list{ flex:1; overflow-y:auto; padding:0 18px 32px }
  .bp-list::-webkit-scrollbar{width:3px}
  .bp-list::-webkit-scrollbar-thumb{background:rgba(15,14,12,.1); border-radius:99px}

  .bp-pod{
    padding:16px 14px; border-radius:18px; margin:0 0 2px;
    cursor:pointer; transition:background .12s;
    display:flex; gap:12px; align-items:center;
    border-top:1px solid rgba(15,14,12,.04);
  }
  .bp-pod:first-child{border-top:none}
  .bp-pod:hover{background:#fff}
  .bp-pod.active{background:#0F0E0C; color:#F4EBD6; border-top-color:transparent}
  .bp-pod.active+.bp-pod{border-top-color:transparent}

  .bp-pod-hex{width:42px; height:42px; flex-shrink:0; position:relative}
  .bp-pod-hex .emoji{
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center; font-size:17px;
  }
  .bp-pod-body{flex:1; min-width:0}
  .bp-pod-name{
    font-weight:700; font-size:14.5px; letter-spacing:-.01em;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .bp-pod-meta{
    margin-top:4px; font-size:12px; color:rgba(15,14,12,.5);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .bp-pod.active .bp-pod-meta{color:rgba(251,247,238,.5)}
  .bp-pod-right{flex-shrink:0; text-align:right}
  .bp-pod-price{font-weight:800; font-size:14.5px}
  .bp-pod.active .bp-pod-price{color:#FFD361}
  .bp-pod-price .unit{font-weight:400; font-size:11px; opacity:.5}
  .bp-pod-dist{
    margin-top:4px; font-family:monospace; font-size:9.5px;
    letter-spacing:.12em; color:rgba(15,14,12,.4);
  }
  .bp-pod.active .bp-pod-dist{color:rgba(251,247,238,.4)}

  /* mobile */
  @media(max-width:760px){
    .bp-app{grid-template-rows:52px 1fr}
    .bp-topbar{padding:0 16px}
    .bp-brand-name{font-size:18px}
    .bp-main{grid-template-columns:1fr; position:relative}
    .bp-panel{
      position:absolute; left:0; right:0; bottom:0;
      height:55vh; max-height:58vh;
      border-right:none; border-top:1px solid rgba(15,14,12,.08);
      border-radius:20px 20px 0 0;
      box-shadow:0 -8px 24px rgba(15,14,12,.10);
      z-index:25;
    }
    .bp-sheet-handle{display:flex; justify-content:center; padding:8px 0 0}
    .bp-sheet-handle::before{
      content:""; width:40px; height:4px; border-radius:99px;
      background:rgba(15,14,12,.18);
    }
    .bp-panel-head{padding:6px 18px 14px}
    .bp-panel-title{font-size:20px}
    .bp-panel-sub{font-size:13px; margin-top:4px}
    .bp-eyebrow{margin-bottom:8px; font-size:9px}
    .bp-search{height:40px; margin-top:12px}
    .bp-divider{padding:0 18px 8px}
    .bp-list{padding:0 12px 20px}
    .bp-pod{padding:12px 10px; gap:10px}
    .bp-pod-hex{width:38px; height:38px}
  }
  @media(min-width:761px){ .bp-sheet-handle{display:none} }
`

function hexPath(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
  }
  return 'M' + pts.join(' L') + ' Z'
}

function PodHex({ active }) {
  return (
    <div className="bp-pod-hex">
      <svg width="42" height="42" viewBox="0 0 44 44">
        <path d={hexPath(22, 22, 20)} fill={active ? '#FFD361' : '#F4EBD6'} stroke={active ? '#F4B928' : 'none'} strokeWidth="1" />
        <path d={hexPath(22, 22, 13)} fill={active ? '#0F0E0C' : '#fff'} />
      </svg>
      <span className="emoji">📚</span>
    </div>
  )
}

function PodRow({ p, active, onSelect }) {
  return (
    <div className={`bp-pod${active ? ' active' : ''}`} onClick={() => onSelect(p.id)}>
      <PodHex active={active} />
      <div className="bp-pod-body">
        <div className="bp-pod-name">{p.name}</div>
        <div className="bp-pod-meta">
          {p.city}{p.amenities ? ` · ${p.amenities.split(',')[0].trim()}` : ''}
          {p.totalSeats ? ` · ${p.totalSeats} seats` : ''}
        </div>
      </div>
      <div className="bp-pod-right">
        <div className="bp-pod-price">₹{p.monthlyRate}<span className="unit">/mo</span></div>
        {p.distKm !== undefined && (
          <div className="bp-pod-dist">{formatDist(p.distKm)} away</div>
        )}
      </div>
    </div>
  )
}

function StudentRadar() {
  const [userLocation, setUserLocation] = useState(null)
  const [pods, setPods] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [locationError, setLocationError] = useState('')
  const [gmap, setGmap] = useState(null)
  const ownerName = localStorage.getItem('name') || 'U'

  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY })

  useEffect(() => {
    fetch(`${API}/api/spaces/verified`)
      .then(r => r.json())
      .then(data => setPods(data.filter(s => s.latitude && s.longitude)))
      .catch(() => {
        fetch(`${API}/api/spaces`).then(r => r.json())
          .then(data => setPods(data.filter(s => s.latitude && s.longitude))).catch(() => {})
      })
    navigator.geolocation.getCurrentPosition(
      pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Enable location to find study rooms')
    )
  }, [])

  const podsWithDist = userLocation
    ? pods.map(p => ({ ...p, distKm: haversineKm(userLocation.lat, userLocation.lng, p.latitude, p.longitude) })).sort((a, b) => a.distKm - b.distKm)
    : pods

  const filtered = search
    ? podsWithDist.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.city || '').toLowerCase().includes(search.toLowerCase()))
    : podsWithDist

  const selected = filtered.find(p => p.id === selectedId)

  const onMapLoad = useCallback(m => {
    setGmap(m)
  }, [])

  useEffect(() => {
    if (!gmap || !userLocation || filtered.length === 0) return
    const bounds = new window.google.maps.LatLngBounds()
    bounds.extend(userLocation)
    filtered.forEach(p => bounds.extend({ lat: p.latitude, lng: p.longitude }))
    gmap.fitBounds(bounds, { top: 20, bottom: 20, left: 20, right: 20 })
  }, [gmap, userLocation, filtered.length])

  function selectPod(id) {
    setSelectedId(id === selectedId ? null : id)
    const pod = pods.find(p => p.id === id)
    if (pod && gmap) {
      gmap.panTo({ lat: pod.latitude, lng: pod.longitude })
      gmap.setZoom(15)
    }
  }

  function waLink(p) {
    return `https://wa.me/?text=${encodeURIComponent(`Hi! I found "${p.name}" on BeePod. Interested in a seat!`)}`
  }

  if (!isLoaded) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF7EE' }}>
      <p style={{ color: 'rgba(15,14,12,.5)', fontSize: 14 }}>Loading map...</p>
    </div>
  )

  const city = filtered[0]?.city || 'near u'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="bp-app">
        {/* Top bar */}
        <div className="bp-topbar">
          <div className="bp-brand">
            <svg width="28" height="28" viewBox="0 0 34 34">
              <path d={hexPath(17, 17, 16)} fill="#0F0E0C" />
              <path d={hexPath(17, 17, 9)} fill="#FFD361" />
              <circle cx="17" cy="17" r="3" fill="#0F0E0C" />
            </svg>
            <span className="bp-brand-name">beepod<span className="dot">.</span></span>
          </div>
          <div className="bp-avatar" onClick={() => { localStorage.clear(); window.location.reload() }} title="Logout">
            {ownerName[0].toUpperCase()}
          </div>
        </div>

        <div className="bp-main">
          {/* Sidebar panel */}
          <aside className="bp-panel">
            <div className="bp-sheet-handle" />
            <div className="bp-panel-head">
              <div className="bp-eyebrow">live · {city}</div>
              <h1 className="bp-panel-title">find ur <em>focus.</em></h1>
              <p className="bp-panel-sub">{filtered.length} pod{filtered.length !== 1 ? 's' : ''} buzzing near u. tap one to peek inside.</p>
              <div className="bp-search">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input placeholder="search study rooms near u" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="bp-divider">
              <div className="bp-count">
                <span className="big">{filtered.length} pods</span>
                <span className="lbl">· nearby</span>
              </div>
              <span className="bp-sort">NEAR</span>
            </div>
            <div className="bp-list">
              {filtered.map(p => (
                <PodRow key={p.id} p={p} active={selectedId === p.id} onSelect={selectPod} />
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                  <p style={{ fontSize: 14, color: 'rgba(15,14,12,.5)' }}>
                    {search ? 'no pods match your search' : 'no pods found nearby'}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Map */}
          <section style={{ position: 'relative', overflow: 'hidden' }}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={userLocation || { lat: 17.68, lng: 83.24 }}
              zoom={13}
              onLoad={onMapLoad}
              options={{
                styles: mapStyles,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: { position: 7 },
                clickableIcons: false,
                gestureHandling: 'greedy',
              }}
            >
              {userLocation && (
                <MarkerF
                  position={userLocation}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#FF2E7E',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 3,
                  }}
                  title="You"
                />
              )}

              {filtered.map(pod => (
                <MarkerF
                  key={pod.id}
                  position={{ lat: pod.latitude, lng: pod.longitude }}
                  onClick={() => selectPod(pod.id)}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                    fillColor: selectedId === pod.id ? '#FF2E7E' : '#FFD361',
                    fillOpacity: 1,
                    strokeColor: selectedId === pod.id ? '#FF2E7E' : '#0F0E0C',
                    strokeWeight: 1.5,
                    scale: selectedId === pod.id ? 1.8 : 1.4,
                    anchor: new window.google.maps.Point(12, 22),
                  }}
                />
              ))}

              {selected && (
                <InfoWindowF
                  position={{ lat: selected.latitude, lng: selected.longitude }}
                  onCloseClick={() => setSelectedId(null)}
                  options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                >
                  <div style={{ fontFamily: 'inherit', padding: '6px 2px', maxWidth: 260 }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 9.5, letterSpacing: '.2em', textTransform: 'uppercase', color: '#A86A07', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C8FF3C', display: 'inline-block' }} />
                      {selected.distKm !== undefined ? formatDist(selected.distKm) + ' away' : selected.city}
                    </div>
                    <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, letterSpacing: '-.02em', color: '#0F0E0C' }}>{selected.name}</h3>
                    <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'rgba(15,14,12,.55)', lineHeight: 1.4 }}>{selected.address}, {selected.city}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-.03em' }}>₹{selected.monthlyRate}</span>
                      <span style={{ fontSize: 13, color: 'rgba(15,14,12,.5)' }}>/mo</span>
                      <span style={{ width: 1, height: 16, background: 'rgba(15,14,12,.1)', margin: '0 6px', alignSelf: 'center' }} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{selected.totalSeats} <span style={{ fontWeight: 400, color: 'rgba(15,14,12,.5)' }}>seats</span></span>
                    </div>
                    <a href={waLink(selected)} target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      padding: '11px 0', borderRadius: 12,
                      background: '#1F8A5B', color: '#fff',
                      fontWeight: 700, fontSize: 14, textDecoration: 'none',
                      boxShadow: '0 6px 14px rgba(31,138,91,.28)',
                    }}>
                      message on whatsapp
                    </a>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>

            {/* Compass overlay */}
            <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pointerEvents: 'none' }}>
              <svg width="16" height="22" viewBox="0 0 18 24">
                <path d="M9 1 L13 14 L9 11 L5 14 Z" fill="#FF2E7E" />
                <path d="M9 11 L13 14 L9 23 L5 14 Z" fill="#0F0E0C" />
              </svg>
              <span style={{ fontFamily: 'monospace', fontSize: 8, letterSpacing: '.2em', color: '#0F0E0C', fontWeight: 600 }}>N</span>
            </div>

            {/* Coordinates */}
            {userLocation && (
              <div style={{ position: 'absolute', bottom: 14, left: 16, zIndex: 4, fontFamily: 'monospace', fontSize: 9.5, letterSpacing: '.12em', color: 'rgba(15,14,12,.45)', pointerEvents: 'none' }}>
                {userLocation.lat.toFixed(4)}°N · {userLocation.lng.toFixed(4)}°E
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 14, right: 16, zIndex: 4, fontFamily: 'monospace', fontSize: 9.5, letterSpacing: '.12em', color: 'rgba(15,14,12,.45)', pointerEvents: 'none' }}>
              © beepod · 2026
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default StudentRadar
