import { useEffect, useState } from "react";

function App() {

  const [users, setUsers] = useState([]);

  useEffect(() => {

    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error(error);
      });

  }, []);


  return (
    <div>
      <h1>Users Database</h1>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default App;
