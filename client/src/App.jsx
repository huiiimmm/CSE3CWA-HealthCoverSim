import { useEffect, useState, input } from "react";

function App() {
  const [hospital_tiers, setHospital_tiers] = useState([]);
  const [extra_tiers, setExtra_tiers] = useState([]);
  const [family_coverage, setFamily_coverage] = useState([]);
  const [user_selections, setUser_selections] = useState([]);  

  const [userId, setUserId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [applicant1Age, setApplicant1Age] = useState(0);
  const [applicant1CoverHistory, setApplicant1CoverHistory] = useState("");
  const [applicant2Age, setApplicant2Age] = useState("");
  const [applicant2CoverHistory, setApplicant2CoverHistory] = useState("");
  const [selectedHospitalTier, setSelectedHospitalTier] = useState("");
  const [selectedExtraTier, setSelectedExtraTier] = useState("");
  const [selectedFamilyCoverage, setSelectedFamilyCoverage] = useState("");
  const [selectedPaymentFrequency, setSelectedPaymentFrequency] = useState("");
  const [annualDiscount, setAnnualDiscount] = useState(0.0);
  const [notes, setNotes] = useState("");

  const [displayTotal, setDisplayTotal] = useState(false);

  const nullInputCheck = () => { 
  // null checks
  if (customerName === '' ||
      applicant1Age === '' ||
      applicant1CoverHistory === '' ||
      selectedHospitalTier === '' ||
      selectedExtraTier === '' ||
      selectedFamilyCoverage === '' ||
      selectedPaymentFrequency === '') {
	
	console.log("Please ensure You have filled out all required fields.");
	alert("please fill it out");
	return;
	}
      
      const familyCoverageSelection = selectedFamilyCoverage.trim().toLowerCase();
      if (selectedFamilyCoverage === "couple" || selectedFamilyCoverage === "family") {
	if (applicant2Age === '' || applicant2CoverHistory === '') {

		console.log("Please enter details for Applicant 2.");
		alert("please fill out applicant 2 as well pleeeeeeaaaaaaase");
		return;
	}
	}
      
      recordCustomerLog(); 
  };

  const recordCustomerLog = () => {
	const customerLogData = {
	  name: customerName,
	  age: applicant1Age,
	  tier: selectedHospitalTier,
	  frequency: selectedPaymentFrequency,
	  timestamp: new Date().toISOString()
	};
	console.log("log recording successful:", recordCustomerLog);
	
	setDisplayTotal(true);
  	return;
  }

  useEffect(() => {
    fetch("/api/hospital_tiers")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error, status: ${res.status}`);
          }
          return res.json();
          })
          .then((data) => {
                setHospital_tiers(Array.isArray(data) ? data : []);
                })
                .catch((error) => {
                  console.error("fetch error:", error);
                  setHospital_tiers([]);
                });

    fetch("/api/extra_tiers")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error, status: ${res.status}`);
          }
          return res.json();
          })
          .then((data) => {
                setExtra_tiers(Array.isArray(data) ? data : []);
                })
                .catch((error) => {
                  console.error("fetch error:", error);
                  setExtra_tiers([]);
                });

    fetch("/api/family_coverage")
      .then((res) => {
	if (!res.ok) {
	  throw new Error(`HTTP error, status: ${res.status}`);
	  }
	  return res.json();
	  })
	  .then((data) => {
		setFamily_coverage(Array.isArray(data) ? data : []);
		})
		.catch((error) => {
		  console.error("fetch error:", error);
		  setFamily_coverage([]);
		}); 

    fetch("/api/user_selections")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error, status: ${res.status}`);
          }
          return res.json();
          })
          .then((data) => {
                setUser_selections(Array.isArray(data) ? data : []);
                })
                .catch((error) => {
                  console.error("fetch error:", error);
                  setUser_selections([]);
                });
	});
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
		value={customerName}
		onChange={(e) => setCustomerName(e.target.value)}
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
                        {family_coverage?.map((tier, index) => (
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
		value={applicant1Age}
                onChange={(e) => {const value = parseInt(e.target.value, 10);
                                  setApplicant1Age(isNaN(value) ? '' : value);
                }}

                />
	
        </div>
	<div>
	<h3>Applicant 1 Hospital Cover History</h3>
	<label htmlFor="applicant1coverhistory">Applicant 1 Cover History: </label>
	<select
		id="applicant1coverhistory"
		value={applicant1CoverHistory}
		onChange={(e) => setApplicant1CoverHistory(e.target.value)}
	>
		<option value="">-- Select Cover History --</option>
		<option>yes</option>
		<option>no</option>
		<option>not sure</option>
	</select>
	</div>
    </div>

    {(selectedFamilyCoverage.trim().toLowerCase() === "couple" || selectedFamilyCoverage.trim().toLowerCase() === "family") && (
	<>
	<div>
        <label htmlFor="applicant2age">Applicant 2 Age: </label>
        <input
                type="number"
                id="applicant2age"
                name="applicant2age"
                min="18"
                max="100"
                placeholder="18-100"
                value={applicant2Age}
                onChange={(e) => {const value = parseInt(e.target.value, 10);
                                  setApplicant2Age(isNaN(value) ? '' : value);
                }}
                />
	</div>
	<div>
        <h3>Applicant 2 Hospital Cover History</h3>
        <label htmlFor="applicant2coverhistory">Applicant 2 Cover History: </label>
        <select
                id="applicant2coverhistory"
                value={applicant2CoverHistory}
                onChange={(e) => setApplicant2CoverHistory(e.target.value)}
        >
                <option value="">-- Select Cover History --</option>
                <option>yes</option>
                <option>no</option>
                <option>not sure</option>
        </select>
	</div>
	</>
	)}
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
                <label htmlFor="payment-frequency-select" style={{ display: "block", fontWeight: "bold" }}>
                        Select Payment Frequency
                </label>
                <select
                        id="payment-frequency-select"
                        value={selectedPaymentFrequency}
                        onChange={(e) => setSelectedPaymentFrequency(e.target.value)}
                >
                        <option value="">-- Choose a Frequency Option --</option>
                        <option value="monthly">Monthly</option>
			<option value="yearly">Yearly</option>
                </select>
        </div>
    {(selectedPaymentFrequency.trim().toLowerCase() === "yearly") && (
	<div>
		<p>Annual Payment Discount (0-10%)</p>
	</div>
    )}
    <div>
	<button onClick={() => nullInputCheck()}>Display Total</button>
    </div>
    <div>
    {displayTotal && (
	<h2>Total</h2>
    )}
    </div>
  </>
  );
}

export default App;

