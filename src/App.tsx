import { useStore } from './store/useStore';
import { UserProfileSetup } from './components/UserProfileSetup';
import { Workspace } from './components/Workspace';

function App() {
  const { isProfileComplete } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {!isProfileComplete ? (
        <UserProfileSetup />
      ) : (
        <Workspace />
      )}
    </div>
  );
}

export default App;
