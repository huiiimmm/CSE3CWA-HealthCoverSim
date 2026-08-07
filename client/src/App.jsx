import { useEffect, useState } from "react";

function App() {

  const [users, setUsers] = useState([]);
  const [hospital_tiers, setHospital_tiers] = useState([]);
  const [extra_tiers, setExtra_tiers] = useState([]);
  const [family_coverage, setFamily_coverage] = useState([]);

  useEffect(() => {

    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error(error);
      });

    fetch("http://localhost:5000/hospital_tiers")
      .then((res) => res.json())
      .then((data) => {
        setHospital_tiers(data);
      })
      .catch((error) => {
        console.error(error);
      });

    fetch("http://localhost:5000/extra_tiers")
      .then((res) => res.json())
      .then((data) => {
        setExtra_tiers(data);
      })
      .catch((error) => {
        console.error(error);
      });

    fetch("http://localhost:5000/family_coverage")
      .then((res) => res.json())
      .then((data) => {
        setFamily_coverage(data);
      })
      .catch((error) => {
        console.error(error);
      });


  }, []);


  return (
    <>
    <div>
      <h1>Health Cover Sim Info Page</h1>
    </div>
    <div>
	<h2>Hospital Cover</h2>
	<table border="1" style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
		<thead>
			<tr>
				<th>Hospital Cover</th>
				<th>Price per Adult</th>
			</tr>
		</thead>
		<tbody>
			{hospital_tiers.map((tier, index) => (
				<tr key={index}>
					<td>{tier.hospital_cover}</td>
					<td>${tier.pp_adult}</td>
				</tr>
			))}
		</tbody>
	</table>
    </div>
    <div>
	<h2>Applicant 1</h2>
    </div>
    <div>
	<h2>Applicant 2</h2>
    </div>
    <div>
        <h2>Family Cover</h2>
        <table border="1" style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
                <thead>
                        <tr>
                                <th>Family Coverage</th>
                                <th>Number of adults</th>
				<th>Extra Fees</th>
                        </tr>
                </thead>
                <tbody>
                        {family_coverage.map((tier, index) => (
                                <tr key={index}>
                                        <td>{tier.cover_type}</td>
                                        <td>{tier.adults_count}</td>
					<td>${tier.upgrade_fee}</td>
                                </tr>
                        ))}
                </tbody>
        </table>
    </div>
    <div>
        <h2>Extras Cover</h2>
        <table border="1" style={{ width: "100%", textAlign: "left", marginTop: "10px" }}>
                <thead>
                        <tr>
                                <th>Extras Cover</th>
                                <th>Price per Adult</th>
                        </tr>
                </thead>
                <tbody>
                        {extra_tiers.map((tier, index) => (
                                <tr key={index}>
                                        <td>{tier.extras_cover}</td>
                                        <td>${tier.pp_adult}</td>
                                </tr>
                        ))}
                </tbody>
        </table>

    </div>
    <div>
        <h2>Payment</h2>
    </div>
    </>
  );
}

export default App;
