import React from 'react';

const ClubForm = ({ clubId, onClubIdChange, onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="players-form">
      <label htmlFor="clubId-input">Club ID: </label>
      <input
        id="clubId-input"
        type="text"
        value={clubId || ''}
        onChange={e => onClubIdChange(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </form>
  );
};

export default ClubForm;