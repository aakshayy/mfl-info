import React from 'react';

const ClubForm = ({ clubId, onClubIdChange, onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="club-form">
      <div className="form-group">
        <label htmlFor="clubId-input" className="form-label">
          Club ID
        </label>
        <div className="input-group">
          <input
            id="clubId-input"
            type="text"
            value={clubId || ''}
            onChange={e => onClubIdChange(e.target.value)}
            disabled={loading}
            className="form-input"
            placeholder="Enter club ID..."
          />
          <button type="submit" disabled={loading || !clubId} className="form-button">
            {loading ? (
              <>
                <span className="loading-spinner" />
                Loading...
              </>
            ) : (
              <>
                Search
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ClubForm;