'use client';

import { useState } from 'react';

export default function Home() {
  const [articleUrl, setArticleUrl] = useState('');
  const [replyToUrl, setReplyToUrl] = useState('');
  const [wpm, setWpm] = useState('500');
  const [composition, setComposition] = useState('random');
  const [account, setAccount] = useState('X2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleUrl,
          replyToUrl,
          wpm: parseInt(wpm),
          composition: composition !== 'random' ? composition : undefined,
          account,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to queue');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0f0f0f, #1a1a1a)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          color: '#fff',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          Speed Reader Video Generator
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#888',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          Generate speed reading videos from tweets and articles
        </p>

        <form onSubmit={handleSubmit} style={{
          background: '#1e1e1e',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #2a2a2a'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '8px'
            }}>
              Article/Tweet URL *
            </label>
            <input
              type="url"
              value={articleUrl}
              onChange={(e) => setArticleUrl(e.target.value)}
              placeholder="https://x.com/user/status/123..."
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                background: '#0f0f0f',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '8px'
            }}>
              Reply To Tweet URL (optional)
            </label>
            <input
              type="url"
              value={replyToUrl}
              onChange={(e) => setReplyToUrl(e.target.value)}
              placeholder="https://x.com/user/status/456..."
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                background: '#0f0f0f',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
              }}
            />
            <p style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
              Leave empty to only generate video without posting
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '8px'
            }}>
              Reading Speed (WPM)
            </label>
            <input
              type="number"
              value={wpm}
              onChange={(e) => setWpm(e.target.value)}
              min="100"
              max="1000"
              step="50"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                background: '#0f0f0f',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '12px'
            }}>
              Video Template
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setComposition('random')}
                style={{
                  flex: '1 1 auto',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: composition === 'random' ? '#E53935' : '#2a2a2a',
                  color: '#fff',
                  border: composition === 'random' ? '2px solid #E53935' : '2px solid #3a3a3a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🎲 Random
              </button>
              <button
                type="button"
                onClick={() => setComposition('RSVPiPhoneZoom')}
                style={{
                  flex: '1 1 auto',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: composition === 'RSVPiPhoneZoom' ? '#E53935' : '#2a2a2a',
                  color: '#fff',
                  border: composition === 'RSVPiPhoneZoom' ? '2px solid #E53935' : '2px solid #3a3a3a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🔍 Zoom (Full)
              </button>
              <button
                type="button"
                onClick={() => setComposition('RSVPiPhoneWithOutro')}
                style={{
                  flex: '1 1 auto',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: composition === 'RSVPiPhoneWithOutro' ? '#E53935' : '#2a2a2a',
                  color: '#fff',
                  border: composition === 'RSVPiPhoneWithOutro' ? '2px solid #E53935' : '2px solid #3a3a3a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                ⚡ Short (6.5s)
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
              Zoom: Full article with zoom animation • Short: 6.5s teaser with outro
            </p>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '12px'
            }}>
              X Account
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setAccount('X')}
                style={{
                  flex: '1',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: account === 'X' ? '#1DA1F2' : '#2a2a2a',
                  color: '#fff',
                  border: account === 'X' ? '2px solid #1DA1F2' : '2px solid #3a3a3a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🐦 Primary (X)
              </button>
              <button
                type="button"
                onClick={() => setAccount('X2')}
                style={{
                  flex: '1',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: account === 'X2' ? '#1DA1F2' : '#2a2a2a',
                  color: '#fff',
                  border: account === 'X2' ? '2px solid #1DA1F2' : '2px solid #3a3a3a',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                🔄 Secondary (X2)
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
              Select which X account to post the video to
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '600',
              background: loading ? '#444' : '#E53935',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Adding to Queue...' : 'Add to Queue'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#2a1616',
            border: '1px solid #4a1f1f',
            borderRadius: '8px',
            color: '#ff6b6b',
            fontSize: '14px'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '24px',
            background: '#1a2a1a',
            border: '1px solid #2a4a2a',
            borderRadius: '12px',
            color: '#6bff6b'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>
              ✅ Added to Queue!
            </h3>
            <p style={{ margin: '8px 0', fontSize: '14px' }}>
              <strong>Status:</strong> {result.message}
            </p>
            {result.queueItem && (
              <>
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>Queue Position:</strong> #{result.queueItem.queuePosition}
                </p>
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>Scheduled Time:</strong> {new Date(result.queueItem.scheduledDate).toLocaleTimeString()}
                </p>
              </>
            )}
            <p style={{ margin: '16px 0 0 0', fontSize: '13px', color: '#88c288' }}>
              Your video will be generated and posted automatically at the scheduled time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
