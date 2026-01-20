export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-primary-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-4 animate-bounce">🌿</div>
        <h1 className="text-3xl font-bold mb-2">Cannabis Journal</h1>
        <p className="text-primary-100">Loading your data...</p>
      </div>
    </div>
  );
}
