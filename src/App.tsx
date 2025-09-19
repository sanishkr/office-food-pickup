import PWAInstallPrompt from "./components/PWAInstallPrompt";

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🍕</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Food Pickup Tracker
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PWAInstallPrompt />

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Welcome to Your PWA Food Tracker! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              This is now a Progressive Web App (PWA) that can be installed on
              your device.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-2xl mb-2">📱</div>
                <h3 className="font-medium text-gray-900 mb-2">Installable</h3>
                <p className="text-sm text-gray-600">
                  Install directly to your home screen
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-2xl mb-2">⚡</div>
                <h3 className="font-medium text-gray-900 mb-2">Fast Loading</h3>
                <p className="text-sm text-gray-600">
                  Cached for instant access
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-2xl mb-2">🔄</div>
                <h3 className="font-medium text-gray-900 mb-2">Auto Updates</h3>
                <p className="text-sm text-gray-600">Always stays up-to-date</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Install the app using the prompt above (if available)</li>
                <li>Test offline functionality</li>
                <li>Use git stash pop to restore our food tracking features</li>
                <li>Enjoy the full PWA experience!</li>
              </ol>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
