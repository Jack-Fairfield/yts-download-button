import { useState, useEffect } from "react";
import "./App.css";

export interface ActiveDownload {
  infoHash: string;
  name: string;
  size: number;
  downloaded: number;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  timeRemaining: number;
  path: string;
}

interface DownloadsResponse {
  count: number;
  downloads: ActiveDownload[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatTime(seconds: number): string {
  if (seconds < 0 || !isFinite(seconds)) return "∞";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

function App() {
  const [downloads, setDownloads] = useState<ActiveDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDownloads = async () => {
    try {
      const response = await fetch("https://192.168.50.63:3000/downloads");
      if (!response.ok) {
        throw new Error("Failed to fetch downloads");
      }
      const data: DownloadsResponse = await response.json();
      setDownloads(data.downloads || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load downloads");
      setDownloads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
    // Refresh every 2 seconds
    const interval = setInterval(fetchDownloads, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="popover-container">
      <div className="popover-header">
        <h2>Active Downloads</h2>
        <div className="download-count">
          {downloads.length} {downloads.length === 1 ? "download" : "downloads"}
        </div>
      </div>

      <div className="popover-content">
        {loading && downloads.length === 0 ? (
          <div className="loading-state">Loading downloads...</div>
        ) : error && downloads.length === 0 ? (
          <div className="error-state">
            <p>{error}</p>
            <button className="retry-button" onClick={fetchDownloads}>
              Retry
            </button>
          </div>
        ) : downloads.length === 0 ? (
          <div className="empty-state">No active downloads</div>
        ) : (
          <div className="downloads-list">
            {downloads.map((download) => (
              <div key={download.infoHash} className="download-item">
                <div className="download-header">
                  <h3 className="download-name" title={download.name}>
                    {download.name}
                  </h3>
                  <span className="download-percentage">
                    {download.progress.toFixed(1)}%
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${download.progress}%` }}
                  />
                </div>
                <div className="download-stats">
                  <div className="stat-item">
                    <span className="stat-label">Speed:</span>
                    <span className="stat-value">
                      {formatBytes(download.downloadSpeed)}/s
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Time:</span>
                    <span className="stat-value">
                      {formatTime(download.timeRemaining)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Peers:</span>
                    <span className="stat-value">{download.numPeers}</span>
                  </div>
                </div>
                <div className="download-size">
                  {formatBytes(download.downloaded)} /{" "}
                  {formatBytes(download.size)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
