// Registration is disabled. Only admin can create users.
export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-black text-center">
        <h2 className="text-2xl font-bold mb-4">Registration Disabled</h2>
        <p>Only the admin can create new users.</p>
      </div>
    </div>
  );
}
