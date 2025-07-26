import React from 'react';

const ClubHeader = ({ 
  clubName, 
  clubLogoUrl, 
  clubLogoLoaded, 
  clubLogoError, 
  onLogoLoad, 
  onLogoError, 
  loading, 
  error 
}) => {
  const handleLogoLoad = () => {
    if (onLogoLoad) onLogoLoad(true);
  };

  const handleLogoError = () => {
    if (onLogoError) onLogoError(true);
  };

  if (loading) {
    return <h2>Loading club information...</h2>;
  }

  if (error) {
    return <h2 style={{color: 'red'}}>Error loading club: {error.message}</h2>;
  }

  if (!clubName) {
    return null;
  }

  return (
    <div className="club-header">
      {clubLogoUrl && !clubLogoError && (
        <img
          src={clubLogoUrl}
          alt={`${clubName} logo`}
          className="club-logo"
          onLoad={handleLogoLoad}
          onError={handleLogoError}
          style={{
            display: clubLogoLoaded ? 'block' : 'none'
          }}
        />
      )}
      <h1 className="club-name">{clubName}</h1>
    </div>
  );
};

export default ClubHeader;