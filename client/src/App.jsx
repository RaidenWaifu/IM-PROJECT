import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import Hub3DCanvas from './components/Hub3DCanvas'
import './App.css'

const modules = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'vehicles', label: 'Vehicles', icon: '🚚' },
  { id: 'drivers', label: 'Drivers', icon: '♙' },
  { id: 'trips', label: 'Trips', icon: '⇄' },
  { id: 'maintenance', label: 'Maintenance', icon: '⚙' },
  { id: 'fuel', label: 'Fuel Records', icon: '⛽' },
  { id: 'reports', label: 'Reports', icon: '▤' },
]

const moduleConfig = {
  drivers: {
    endpoint: '/drivers',
    columns: [
      ['driver_id', 'Driver ID'],
      ['first_name', 'First Name'],
      ['last_name', 'Last Name'],
      ['contact_number', 'Contact'],
      ['email', 'Email'],
      ['license_number', 'License Number'],
      ['license_expiry', 'License Expiry'],
      ['branch_name', 'Branch'],
      ['employment_status', 'Status'],
    ],
  },
  trips: {
    endpoint: '/trips',
    columns: [
      ['trip_id', 'Trip ID'],
      ['trip_date', 'Date'],
      ['plate_number', 'Vehicle'],
      ['driver_first_name', 'Driver First Name'],
      ['driver_last_name', 'Driver Last Name'],
      ['origin', 'Origin'],
      ['destination', 'Destination'],
      ['trip_status', 'Status'],
      ['starting_mileage', 'Start Mileage'],
      ['ending_mileage', 'End Mileage'],
    ],
  },
  maintenance: {
    endpoint: '/maintenance',
    columns: [
      ['maintenance_id', 'Record ID'],
      ['plate_number', 'Vehicle'],
      ['technician_first_name', 'Technician First Name'],
      ['technician_last_name', 'Technician Last Name'],
      ['maintenance_date', 'Date'],
      ['maintenance_type', 'Type'],
      ['description', 'Description'],
      ['status', 'Status'],
      ['total_cost', 'Total Cost'],
    ],
  },
  fuel: {
    endpoint: '/fuel-records',
    columns: [
      ['fuel_record_id', 'Record ID'],
      ['plate_number', 'Vehicle'],
      ['fuel_date', 'Date'],
      ['liters', 'Liters'],
      ['price_per_liter', 'Price per Liter'],
      ['total_cost', 'Total Cost'],
      ['odometer_reading', 'Odometer'],
      ['fuel_station', 'Fuel Station'],
    ],
  },
}

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loggedIn, setLoggedIn] = useState(
    Boolean(sessionStorage.getItem('fleettrack_token'))
  )
  const [activeModule, setActiveModule] = useState('overview')
  const [vehicles, setVehicles] = useState([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [vehicleError, setVehicleError] = useState('')
  const [showVehicleForm, setShowVehicleForm] = useState(false)
const [vehicleForm, setVehicleForm] = useState({
  vehicle_type_id: '',
  branch_id: '',
  plate_number: '',
  make: '',
  model: '',
  year_acquired: '',
  current_mileage: '',
})
const [vehicleSaveError, setVehicleSaveError] = useState('')
const [vehicleSaving, setVehicleSaving] = useState(false)
  const [moduleData, setModuleData] = useState({})
  const [moduleLoading, setModuleLoading] = useState(false)
  const [moduleError, setModuleError] = useState('')
  const [reportData, setReportData] = useState(null)

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Login failed.')
      }

      if (!result.token) {
        throw new Error('The server did not return an authentication token.')
      }

      sessionStorage.setItem('fleettrack_token', result.token)
      setLoggedIn(true)
    } catch (err) {
      setError(err.message || 'Unable to connect to the server.')
    } finally {
      setLoading(false)
    }
  }

  async function loadVehicles() {
    setVehiclesLoading(true)
    setVehicleError('')

    try {
      const result = await apiRequest('/vehicles')
      setVehicles(result.data || [])
    } catch (err) {
      setVehicleError(err.message || 'Unable to load vehicles.')
    } finally {
      setVehiclesLoading(false)
    }
  }

  async function loadModule(moduleId) {
    if (moduleId === 'overview' || moduleId === 'vehicles') return

    setModuleLoading(true)
    setModuleError('')

    try {
      if (moduleId === 'reports') {
        const result = await apiRequest('/reports')
        setReportData(result.data || null)
      } else {
        const config = moduleConfig[moduleId]
        const result = await apiRequest(config.endpoint)
        setModuleData((previous) => ({
          ...previous,
          [moduleId]: result.data || [],
        }))
      }
    } catch (err) {
      setModuleError(err.message || 'Unable to load records.')
    } finally {
      setModuleLoading(false)
    }
  }

  useEffect(() => {
    if (loggedIn) loadVehicles()
  }, [loggedIn])

async function handleCreateVehicle(event) {
  event.preventDefault()
  setVehicleSaving(true)
  setVehicleSaveError('')

  const payload = {
    vehicle_type_id: Number(vehicleForm.vehicle_type_id),
    branch_id: Number(vehicleForm.branch_id),
    plate_number: vehicleForm.plate_number.trim(),
    make: vehicleForm.make.trim() || null,
    model: vehicleForm.model.trim() || null,
    year_acquired: vehicleForm.year_acquired
      ? Number(vehicleForm.year_acquired)
      : null,
    current_mileage: vehicleForm.current_mileage
      ? Number(vehicleForm.current_mileage)
      : null,
  }

  try {
    await apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    setShowVehicleForm(false)
    setVehicleForm({
      vehicle_type_id: '',
      branch_id: '',
      plate_number: '',
      make: '',
      model: '',
      year_acquired: '',
      current_mileage: '',
    })

    await loadVehicles()
  } catch (err) {
    setVehicleSaveError(err.message || 'Unable to register vehicle.')
  } finally {
    setVehicleSaving(false)
  }
}

  useEffect(() => {
    if (loggedIn && activeModule !== 'overview' && activeModule !== 'vehicles') {
      loadModule(activeModule)
    }
  }, [loggedIn, activeModule])

  function handleLogout() {
    sessionStorage.removeItem('fleettrack_token')
    setLoggedIn(false)
    setUsername('')
    setPassword('')
    setVehicles([])
    setModuleData({})
    setReportData(null)
    setActiveModule('overview')
  }

  if (!loggedIn) {
    return (
      <main className="login-page">
        <section className="login-card">
          <div className="brand">
            <div className="brand-icon">F</div>
            <div>
              <h1>FleetTrack</h1>
              <p>Fleet Management System</p>
            </div>
          </div>

          <div className="welcome">
            <h2>Welcome back</h2>
            <p>Sign in to access your fleet management workspace.</p>
          </div>

          <form onSubmit={handleLogin}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error && <div className="error-message">{error}</div>}

            <button className="login-button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="login-footer">
            Secure access for authorized FleetTrack users.
          </p>
        </section>
      </main>
    )
  }

  const activeLabel =
    modules.find((item) => item.id === activeModule)?.label || 'Overview'

  return (
    <main className="hub-layout">
      <aside className="hub-sidebar">
        <div className="hub-logo">
          <div className="brand-icon">F</div>
          <div>
            <h2>FleetTrack</h2>
            <span>OPERATIONS HUB</span>
          </div>
        </div>

        <p className="sidebar-heading">WORKSPACE</p>

        <nav className="hub-navigation">
          {modules.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.id === 'vehicles' && (
                <span className="nav-count">{vehicles.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="account-info">
            <div className="account-avatar">A</div>
            <div>
              <strong>{username || 'FleetTrack User'}</strong>
              <span>Authenticated user</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <section className="hub-main">
        <header className="hub-topbar">
          <div>
            <span className="topbar-label">FLEET MANAGEMENT</span>
            <h1>{activeLabel}</h1>
          </div>
          <span className="system-indicator">
            <span className="status-dot" /> SYSTEM ONLINE
          </span>
        </header>

        <div className="hub-content">
          {activeModule === 'overview' && (
            <>
              <div className="welcome-heading">
                <div>
                  <h2>Operations Dashboard</h2>
                  <p>Monitor your fleet operations at a glance.</p>
                </div>
                <button
                  className="refresh-button"
                  onClick={() => {
                    loadVehicles()
                    loadModule('reports')
                  }}
                >
                  ↻ Refresh
                </button>
              </div>

              <div className="dashboard-stats">
                <StatCard label="Total Vehicles" value={vehicles.length} />
                <StatCard label="Total Drivers" value={reportData?.total_drivers ?? 'Loading'} />
                <StatCard label="Total Trips" value={reportData?.total_trips ?? 'Loading'} />
                <StatCard label="Maintenance Records" value={reportData?.total_maintenance_records ?? 'Loading'} />
                <StatCard label="Fuel Records" value={reportData?.total_fuel_records ?? 'Loading'} />
                <StatCard label="System Status" value="Online" />
              </div>

              <section className="visualization-section">
                <div className="section-heading">
                  <div>
                    <h3>Fleet Visualization</h3>
                    <p>3D overview of the FleetTrack vehicle fleet.</p>
                  </div>
                  <span className="live-indicator">SYSTEM ACTIVE</span>
                </div>
                <Hub3DCanvas />
              </section>

              <section className="vehicle-section">
                <div className="section-heading">
                  <div>
                    <h3>Vehicle Records</h3>
                    <p>Data retrieved from your FleetTrack database.</p>
                  </div>
                  <button className="text-button" onClick={() => setActiveModule('vehicles')}>
                    View all vehicles →
                  </button>
                </div>
                <VehicleTable vehicles={vehicles.slice(0, 5)} loading={vehiclesLoading} error={vehicleError} />
              </section>
            </>
          )}

          {activeModule === 'vehicles' && (
            <section className="vehicle-section">
              <div className="section-heading">
                <div>
                  <h3>Vehicle Management</h3>
                  <p>Registered vehicles from your database.</p>
                </div>
                <button className="refresh-button" onClick={loadVehicles} disabled={vehiclesLoading}>
                  {vehiclesLoading ? 'Loading...' : '↻ Refresh'}
                </button>
                <button
  className="refresh-button"
  onClick={() => {
    setVehicleSaveError('')
    setShowVehicleForm(!showVehicleForm)
  }}
>
  {showVehicleForm ? 'Cancel' : '+ Register Vehicle'}
</button>
              </div>

{showVehicleForm && (
  <form className="vehicle-form" onSubmit={handleCreateVehicle}>
    <h3>Register New Vehicle</h3>

    <label>Vehicle Type ID</label>
    <input
      type="number"
      min="1"
      required
      value={vehicleForm.vehicle_type_id}
      onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type_id: e.target.value })}
    />

    <label>Branch ID</label>
    <input
      type="number"
      min="1"
      required
      value={vehicleForm.branch_id}
      onChange={(e) => setVehicleForm({ ...vehicleForm, branch_id: e.target.value })}
    />

    <label>Plate Number</label>
    <input
      required
      value={vehicleForm.plate_number}
      onChange={(e) => setVehicleForm({ ...vehicleForm, plate_number: e.target.value })}
    />

    <label>Make</label>
    <input
      value={vehicleForm.make}
      onChange={(e) => setVehicleForm({ ...vehicleForm, make: e.target.value })}
    />

    <label>Model</label>
    <input
      value={vehicleForm.model}
      onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
    />

    <label>Year Acquired</label>
    <input
      type="number"
      min="1900"
      max="2100"
      value={vehicleForm.year_acquired}
      onChange={(e) => setVehicleForm({ ...vehicleForm, year_acquired: e.target.value })}
    />

    <label>Current Mileage</label>
    <input
      type="number"
      min="0"
      step="0.1"
      value={vehicleForm.current_mileage}
      onChange={(e) => setVehicleForm({ ...vehicleForm, current_mileage: e.target.value })}
    />

    {vehicleSaveError && (
      <p className="error-message">{vehicleSaveError}</p>
    )}

    <button type="submit" className="refresh-button" disabled={vehicleSaving}>
      {vehicleSaving ? 'Saving...' : 'Save Vehicle'}
    </button>
  </form>
)}

              <VehicleTable vehicles={vehicles} loading={vehiclesLoading} error={vehicleError} />
            </section>
          )}

          {moduleConfig[activeModule] && (
            <DataModule
              title={activeLabel}
              config={moduleConfig[activeModule]}
              rows={moduleData[activeModule] || []}
              loading={moduleLoading}
              error={moduleError}
              onRefresh={() => loadModule(activeModule)}
            />
          )}

          {activeModule === 'reports' && (
            <ReportsModule
              data={reportData}
              loading={moduleLoading}
              error={moduleError}
              onRefresh={() => loadModule('reports')}
            />
          )}
        </div>
      </section>
    </main>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
    </div>
  )
}

function DataModule({ title, config, rows, loading, error, onRefresh }) {
  return (
    <section className="vehicle-section">
      <div className="section-heading">
        <div>
          <h3>{title} Records</h3>
          <p>{rows.length} records retrieved from your database.</p>
        </div>
        <button className="refresh-button" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {loading ? (
        <p className="table-message">Loading {title.toLowerCase()}...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : rows.length === 0 ? (
        <p className="table-message">No records found.</p>
      ) : (
        <div className="table-wrapper">
          <table className="vehicle-table">
            <thead>
              <tr>
                {config.columns.map(([key, label]) => <th key={key}>{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.driver_id || row.trip_id || row.maintenance_id || row.fuel_record_id || index}>
                  {config.columns.map(([key]) => (
                    <td key={key}>{formatValue(row[key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function ReportsModule({ data, loading, error, onRefresh }) {
  const reportCards = [
    ['Total Vehicles', data?.total_vehicles],
    ['Total Drivers', data?.total_drivers],
    ['Total Trips', data?.total_trips],
    ['Maintenance Records', data?.total_maintenance_records],
    ['Fuel Records', data?.total_fuel_records],
    ['Maintenance Cost', data?.maintenance_cost, true],
    ['Fuel Cost', data?.fuel_cost, true],
  ]

  return (
    <section className="vehicle-section">
      <div className="section-heading">
        <div>
          <h3>Fleet Reports</h3>
          <p>Summary based on recorded FleetTrack data.</p>
        </div>
        <button className="refresh-button" onClick={onRefresh} disabled={loading}>
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </div>

      {loading ? (
        <p className="table-message">Loading reports...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="dashboard-stats">
          {reportCards.map(([label, value, currency]) => (
            <StatCard
              key={label}
              label={label}
              value={value == null ? 'N/A' : currency ? `₱${Number(value).toLocaleString()}` : Number(value).toLocaleString()}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (typeof value === 'number') return value.toLocaleString()
  return value
}

function VehicleTable({ vehicles, loading, error }) {
  if (loading) return <p className="table-message">Loading vehicle records...</p>
  if (error) return <p className="error-message">{error}</p>
  if (!vehicles.length) return <p className="table-message">No vehicle records found.</p>

  return (
    <div className="table-wrapper">
      <table className="vehicle-table">
        <thead>
          <tr>
            <th>Plate Number</th>
            <th>Make</th>
            <th>Model</th>
            <th>Year</th>
            <th>Branch</th>
            <th>Vehicle Type</th>
            <th>Mileage</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.vehicle_id}>
              <td>{vehicle.plate_number || 'N/A'}</td>
              <td>{vehicle.make || 'N/A'}</td>
              <td>{vehicle.model || 'N/A'}</td>
              <td>{vehicle.year_acquired || 'N/A'}</td>
              <td>{vehicle.branch_name || 'N/A'}</td>
              <td>{vehicle.vehicle_type_name || 'N/A'}</td>
              <td>{vehicle.current_mileage?.toLocaleString() ?? 'N/A'}</td>
              <td>{vehicle.vehicle_status || 'Not specified'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App