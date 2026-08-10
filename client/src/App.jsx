import { useEffect, useState, input } from "react";

function App() {

  const [users, setUsers] = useState([]);
  const [hospital_tiers, setHospital_tiers] = useState([]);
  const [extra_tiers, setExtra_tiers] = useState([]);
  const [family_coverage, setFamily_coverage] = useState([]);
  
  const [selectedHospitalTier, setSelectedHospitalTier] = useState("");
  const [selectedExtraTier, setSelectedExtraTier] = useState("");
  const [selectedFamilyCoverage, setSelectedFamilyCoverage] = useState("");

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
	<label htmlFor="customername">Customer Name: </label>
	<input 
		type="text" 
		id="customername" 
		name="customername" 
		placeholder="e.g. James Baxter"
		/>
    </div>
    <div>
        <div>
                <label htmlFor="family-cover-select" style={{ display: "block", fontWeight: "bold" }}>
                        Select Family Cover
                </label>
                <select
                        id="family-cover-select"
                        value={selectedFamilyCoverage}
                        onChange={(e) => setSelectedFamilyCoverage(e.target.value)}
                >
                        <option value="">-- Choose a Family Tier --</option>
                        {family_coverage.map((tier, index) => (
                                <option key={index} value={tier.cover_type}>
                                        {tier.cover_type} ({tier.adults_count} adults ${tier.upgrade_fee} extra monthly fee)    
                                </option>
                                ))}
                </select>
	</div>
	<div>
        <label htmlFor="applicant1age">Applicant 1 Age: </label>
        <input
                type="number"
                id="applicant1age"
                name="applicant1age"
		min="18"
		max="100"
                placeholder="18-100"
                />
	
        </div>
	<div>
	<h3>Applicant 1 Hospital Cover History</h3>
	</div>
    </div>
    {(selectedFamilyCoverage.trim().toLowerCase() === "couple" || selectedFamilyCoverage.trim().toLowerCase() === "family") && (
	<div>
        <label htmlFor="applicant2age">Applicant 2 Age: </label>
        <input
                type="number"
                id="applicant2age"
                name="applicant2age"
                min="18"
                max="100"
                placeholder="18-100"
                />
	
	
        <h3>Applicant 2 Hospital Cover History</h3>
	</div>
    )}
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
    	<h2>Select Hospital Cover</h2>
	<div>
		<label htmlFor="hospital-cover-select" style={{ display: "block", fontWeight: "bold" }}>
			Select Hospital Tier
		</label>
		<select
			id="hospital-cover-select"
			value={selectedHospitalTier}
			onChange={(e) => setSelectedHospitalTier(e.target.value)}
		>
			<option value="">-- Choose a Hospital Tier --</option>
			{hospital_tiers.map((tier, index) => (
				<option key={index} value={tier.hospital_cover}>
					{tier.hospital_cover} (${tier.pp_adult}/adult)
				</option>
				))}
		</select>
	</div>
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
        <h2>Select Extras Cover</h2>
        <div>
                <label htmlFor="extra-cover-select" style={{ display: "block", fontWeight: "bold" }}>
                        Select Extras Tier
                </label>
                <select
                        id="extra-cover-select"
                        value={selectedExtraTier}
                        onChange={(e) => setSelectedExtraTier(e.target.value)}
                >
                        <option value="">-- Choose an Extras Tier --</option>
                        {extra_tiers.map((tier, index) => (
                                <option key={index} value={tier.extras_cover}>
                                        {tier.extras_cover} (${tier.pp_adult}/adult)
                                </option>
                                ))}
                </select>
        </div>
    </div>
    <div>
        <h2>Payment</h2>
    </div>
    </>
  );
}

export default App;
