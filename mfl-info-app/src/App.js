import './App.css';
import { useClubData } from './hooks/useClubData';
import ClubForm from './components/ClubForm';
import PlayersTable from './PlayersTable';

function App() {
  const clubData = useClubData();
  const { clubId, setClubId, loadClubData, loading } = clubData;

  const handleSubmit = () => {
    if (clubId) {
      loadClubData(clubId);
    }
  };

  return (
    <div className="App">
      <h1>MFL Club Overview</h1>
      
      {/* Club Selection Section */}
      <div className="club-selection-section">
        <h2>Select Club</h2>
        <ClubForm 
          clubId={clubId}
          onClubIdChange={setClubId}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Players and Data Section */}
      <PlayersTable clubData={clubData} />
    </div>
  );
}

export default App;
