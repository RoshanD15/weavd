import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  return (
    <main style={{ flex: 1, padding: "2rem" }}>
      <h2>Profile</h2>
      {!user ? (
        <div>Loading profile...</div>
      ) : (
        <div>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          {/* Add more user info here */}
        </div>
      )}
    </main>
  );
};

export default Profile;