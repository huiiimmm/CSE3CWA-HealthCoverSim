import { useEffect, useState } from "react";

function App() {
  const [isSystemReady, setIsSystemReady] = useState(false);

  const [hospital_tiers, setHospital_tiers] = useState([]);
  const [extra_tiers, setExtra_tiers] = useState([]);
  const [family_coverage, setFamily_coverage] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [applicant1Age, setApplicant1Age] = useState("");
  const [applicant1CoverHistory, setApplicant1CoverHistory] = useState("");
  const [applicant2Age, setApplicant2Age] = useState("");
  const [applicant2CoverHistory, setApplicant2CoverHistory] = useState("");

  const [selectedHospitalTier, setSelectedHospitalTier] = useState("");
  const [selectedExtraTier, setSelectedExtraTier] = useState("");
  const [selectedFamilyCoverage, setSelectedFamilyCoverage] = useState("");
  const [selectedPaymentFrequency, setSelectedPaymentFrequency] = useState("");

  const [displayTotal, setDisplayTotal] = useState(false);
  const [currentLog, setCurrentLog] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");

  const isTwoAdultCover =
    selectedFamilyCoverage.trim().toLowerCase() === "couple" ||
    selectedFamilyCoverage.trim().toLowerCase() === "family";

  const handleAgeChange = (value, setter) => {
    if (value === "") {
      setter("");
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const numericValue = Number(value);

    if (numericValue > 100) {
      setter("100");
      return;
    }

    setter(value);
  };

  const validateAge = (age, applicantName) => {
    if (age === "") {
      return `${applicantName} age is required.`;
    }

    const numericAge = Number(age);

    if (!Number.isInteger(numericAge)) {
      return `${applicantName} age must be a whole number.`;
    }

    if (numericAge < 18 || numericAge > 100) {
      return `${applicantName} age must be between 18 and 100.`;
    }

    return "";
  };

  const nullInputCheck = () => {
    setValidationMessage("");

    const trimmedName = customerName.trim();

    if (!trimmedName) {
      setValidationMessage("Please enter the customer's name.");
      return;
    }

    if (trimmedName.length > 100) {
      setValidationMessage("Customer name must be 100 characters or fewer.");
      return;
    }

    const applicant1AgeError = validateAge(
      applicant1Age,
      "Applicant 1"
    );

    if (applicant1AgeError) {
      setValidationMessage(applicant1AgeError);
      return;
    }

    if (!applicant1CoverHistory) {
      setValidationMessage("Please select Applicant 1's cover history.");
      return;
    }

    if (!selectedFamilyCoverage) {
      setValidationMessage("Please select a family coverage option.");
      return;
    }

    if (!selectedHospitalTier) {
      setValidationMessage("Please select a hospital cover tier.");
      return;
    }

    if (!selectedExtraTier) {
      setValidationMessage("Please select an extras cover tier.");
      return;
    }

    if (!selectedPaymentFrequency) {
      setValidationMessage("Please select a payment frequency.");
      return;
    }

    if (isTwoAdultCover) {
      const applicant2AgeError = validateAge(
        applicant2Age,
        "Applicant 2"
      );

      if (applicant2AgeError) {
        setValidationMessage(applicant2AgeError);
        return;
      }

      if (!applicant2CoverHistory) {
        setValidationMessage("Please select Applicant 2's cover history.");
        return;
      }
    }

    recordCustomerLog();
  };

  const recordCustomerLog = () => {
    const customerLogData = {
      customerName: customerName.trim(),
      selectedFamilyCoverage: selectedFamilyCoverage.trim().toLowerCase(),
      applicant1Age: Number(applicant1Age),
      applicant1CoverHistory: applicant1CoverHistory.toLowerCase(),
      applicant2Age: isTwoAdultCover ? Number(applicant2Age) : "",
      applicant2CoverHistory: isTwoAdultCover
        ? applicant2CoverHistory.toLowerCase()
        : "",
      selectedHospitalTier: selectedHospitalTier.trim(),
      selectedExtraTier: selectedExtraTier.trim(),
      selectedPaymentFrequency:
        selectedPaymentFrequency.trim().toLowerCase(),
    };

    fetch("/api/save-record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customerLogData),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `HTTP backend error, status: ${res.status}`
          );
        }

        return res.json();
      })
      .then((data) => {
        if (!data.record) {
          throw new Error("Backend did not return a record.");
        }

        setCurrentLog((prev) => [...prev, data.record]);
        setDisplayTotal(true);
        setValidationMessage("");
      })
      .catch((error) => {
        console.error("Failed to save log:", error);
        setValidationMessage(
          "Unable to save the customer record. Please try again."
        );
      });
  };

  const calculateCostDetails = (record) => {
    const hospitalCover = hospital_tiers.find(
      (tier) =>
        tier.hospital_cover?.toLowerCase() ===
        record.selectedHospitalTier?.toLowerCase()
    );

    const extraCover = extra_tiers.find(
      (tier) =>
        tier.extras_cover?.toLowerCase() ===
        record.selectedExtraTier?.toLowerCase()
    );

    const familyCover = family_coverage.find(
      (tier) =>
        tier.cover_type?.toLowerCase() ===
        record.selectedFamilyCoverage?.toLowerCase()
    );

    if (!hospitalCover || !extraCover || !familyCover) {
      return {
        applicant1Base: 0,
        applicant1Loading: 0,
        applicant1Total: 0,
        applicant2Base: 0,
        applicant2Loading: 0,
        applicant2Total: 0,
        hospitalTotal: 0,
        extrasTotal: 0,
        familyFee: 0,
        monthlyPremium: 0,
        discount: 0,
        finalTotal: 0,
        adultCount: 1,
      };
    }

    const adultCount =
      record.selectedFamilyCoverage === "family" ||
      record.selectedFamilyCoverage === "couple"
        ? 2
        : 1;

    let applicant1Loading = 0;

    if (
      ["no", "not sure"].includes(
        record.applicant1CoverHistory?.toLowerCase()
      ) &&
      Number(record.applicant1Age) > 30
    ) {
      applicant1Loading =
        (Number(record.applicant1Age) - 30) * 0.02;
    }

    let applicant2Loading = 0;

    if (
      adultCount === 2 &&
      ["no", "not sure"].includes(
        record.applicant2CoverHistory?.toLowerCase()
      ) &&
      Number(record.applicant2Age) > 30
    ) {
      applicant2Loading =
        (Number(record.applicant2Age) - 30) * 0.02;
    }

    const applicant1Base = Number(hospitalCover.pp_adult);
    const applicant2Base =
      adultCount === 2 ? Number(hospitalCover.pp_adult) : 0;

    const applicant1Total =
      applicant1Base * (1 + applicant1Loading);

    const applicant2Total =
      adultCount === 2
        ? applicant2Base * (1 + applicant2Loading)
        : 0;

    const hospitalTotal =
      applicant1Total + applicant2Total;

    const extrasTotal =
      Number(extraCover.pp_adult) * adultCount;

    const familyFee =
      Number(familyCover.upgrade_fee) || 0;

    const monthlyPremium =
      hospitalTotal +
      extrasTotal +
      familyFee;

    const discount =
      record.selectedPaymentFrequency?.toLowerCase() === "yearly"
        ? monthlyPremium * 12 * 0.05
        : 0;

    const finalTotal =
      record.selectedPaymentFrequency?.toLowerCase() === "yearly"
        ? monthlyPremium * 12 - discount
        : monthlyPremium;

    return {
      applicant1Base,
      applicant1Loading,
      applicant1Total,
      applicant2Base,
      applicant2Loading,
      applicant2Total,
      hospitalTotal,
      extrasTotal,
      familyFee,
      monthlyPremium,
      discount,
      finalTotal,
      adultCount,
    };
  };

  const calculateCost = (record) => {
    return calculateCostDetails(record).finalTotal;
  };

  const totalCost = currentLog.reduce(
    (total, record) => total + calculateCost(record),
    0
  );

  useEffect(() => {
    if (!isSystemReady) return;

    const fetchData = async () => {
      try {
        const [
          hospitalResponse,
          extrasResponse,
          familyResponse,
        ] = await Promise.all([
          fetch("/api/hospital_tiers"),
          fetch("/api/extra_tiers"),
          fetch("/api/family_coverage"),
        ]);

        if (
          !hospitalResponse.ok ||
          !extrasResponse.ok ||
          !familyResponse.ok
        ) {
          throw new Error("Failed to load cover data.");
        }

        const [
          hospitalData,
          extrasData,
          familyData,
        ] = await Promise.all([
          hospitalResponse.json(),
          extrasResponse.json(),
          familyResponse.json(),
        ]);

        setHospital_tiers(
          Array.isArray(hospitalData) ? hospitalData : []
        );

        setExtra_tiers(
          Array.isArray(extrasData) ? extrasData : []
        );

        setFamily_coverage(
          Array.isArray(familyData) ? familyData : []
        );
      } catch (error) {
        console.error("Failed to load cover data:", error);
        setHospital_tiers([]);
        setExtra_tiers([]);
        setFamily_coverage([]);
        setValidationMessage(
          "Unable to load cover options. Please refresh and try again."
        );
      }
    };

    fetchData();
  }, [isSystemReady]);

  return (
    <div className="app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          background: #f3f6fa;
          color: #172033;
        }

        .app {
          min-height: 100vh;
        }

        .boot-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 18px;
          padding: 24px;
          background: linear-gradient(135deg, #eef5ff, #f7f9fc);
        }

        .boot-screen h2 {
          margin: 0;
          color: #183b66;
        }

        .container {
          width: min(1100px, calc(100% - 32px));
          margin: 0 auto;
          padding: 36px 0 50px;
        }

        .header {
          margin-bottom: 24px;
        }

        .header h1 {
          margin: 0 0 8px;
          color: #173b68;
          font-size: clamp(1.8rem, 4vw, 2.5rem);
        }

        .header p {
          margin: 0;
          color: #65748b;
        }

        .card {
          background: white;
          border: 1px solid #e1e7ef;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 18px;
          box-shadow: 0 5px 18px rgba(20, 40, 70, 0.05);
        }

        .card h2 {
          margin-top: 0;
          color: #183b66;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        label {
          font-weight: 650;
          color: #33445b;
        }

        input,
        select {
          width: 100%;
          min-height: 44px;
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: white;
          color: #172033;
          font-size: 0.95rem;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #2875c7;
          box-shadow: 0 0 0 3px rgba(40, 117, 199, 0.14);
        }

        input:invalid {
          border-color: #d6a3a3;
        }

        .hint {
          color: #718096;
          font-size: 0.82rem;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 22px;
        }

        button {
          border: 0;
          border-radius: 8px;
          padding: 11px 20px;
          min-height: 44px;
          background: #1769aa;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
        }

        button:hover {
          background: #12598f;
          transform: translateY(-1px);
        }

        .error {
          margin: 0;
          color: #a12828;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .results {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        th,
        td {
          padding: 12px 10px;
          text-align: left;
          border-bottom: 1px solid #e7ebf0;
          white-space: nowrap;
        }

        th {
          background: #f5f8fb;
          color: #34465e;
          font-weight: 700;
        }

        tbody tr:hover {
          background: #fafcff;
        }

        tfoot th {
          background: #edf4fb;
          color: #173b68;
          font-size: 1rem;
        }

        .total {
          color: #1769aa;
          font-weight: 800;
        }

        .calculation {
          margin-top: 24px;
          padding: 20px;
          background: #f7faff;
          border: 1px solid #dce8f5;
          border-radius: 10px;
        }

        .calculation h3 {
          margin: 0 0 16px;
          color: #183b66;
        }

        .calculation-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 9px 0;
          border-bottom: 1px solid #e3eaf2;
        }

        .calculation-row:last-child {
          border-bottom: 0;
        }

        .calculation-label {
          color: #526277;
        }

        .calculation-value {
          color: #172033;
          font-weight: 650;
          text-align: right;
        }

        .calculation-total {
          margin-top: 10px;
          padding-top: 14px;
          border-top: 2px solid #b9cde2;
          font-size: 1.05rem;
          color: #1769aa;
          font-weight: 800;
        }

        .formula {
          margin: 12px 0 0;
          padding: 12px;
          border-radius: 7px;
          background: #edf4fb;
          color: #40536a;
          font-size: 0.88rem;
          line-height: 1.5;
        }

        @media (max-width: 700px) {
          .container {
            width: min(100% - 20px, 1100px);
            padding-top: 22px;
          }

          .card {
            padding: 18px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .calculation-row {
            flex-direction: column;
            gap: 4px;
          }

          .calculation-value {
            text-align: left;
          }
        }
      `}</style>

      {!isSystemReady ? (
        <div className="boot-screen">
          <h2>Systems Initializing...</h2>
          <button onClick={() => setIsSystemReady(true)}>
            Connect & Load Data
          </button>
        </div>
      ) : (
        <main className="container">
          <header className="header">
            <h1>Health Cover Sim</h1>
            <p>Enter customer details and select the required cover.</p>
          </header>

          <section className="card">
            <h2>Customer Details</h2>

            <div className="form-grid">
              <div className="field full">
                <label htmlFor="customername">
                  Customer Name
                </label>

                <input
                  type="text"
                  id="customername"
                  name="customername"
                  placeholder="e.g. James Baxter"
                  value={customerName}
                  maxLength={100}
                  autoComplete="name"
                  onChange={(e) =>
                    setCustomerName(e.target.value)
                  }
                />

                <span className="hint">
                  Maximum 100 characters.
                </span>
              </div>

              <div className="field">
                <label htmlFor="family-cover-select">
                  Family Cover
                </label>

                <select
                  id="family-cover-select"
                  value={selectedFamilyCoverage}
                  onChange={(e) => {
                    setSelectedFamilyCoverage(e.target.value);

                    if (
                      !["couple", "family"].includes(
                        e.target.value.toLowerCase()
                      )
                    ) {
                      setApplicant2Age("");
                      setApplicant2CoverHistory("");
                    }
                  }}
                >
                  <option value="">
                    -- Choose a Family Tier --
                  </option>

                  {family_coverage.map((tier, index) => (
                    <option
                      key={index}
                      value={tier.cover_type}
                    >
                      {tier.cover_type} ({tier.adults_count} adults,
                      {" "}
                      ${tier.upgrade_fee} extra monthly fee)
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="payment-frequency-select">
                  Payment Frequency
                </label>

                <select
                  id="payment-frequency-select"
                  value={selectedPaymentFrequency}
                  onChange={(e) =>
                    setSelectedPaymentFrequency(e.target.value)
                  }
                >
                  <option value="">
                    -- Choose a Frequency Option --
                  </option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>

                {selectedPaymentFrequency === "yearly" && (
                  <span className="hint">
                    Yearly payments receive a 5% discount.
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="card">
            <h2>Applicant Details</h2>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="applicant1age">
                  Applicant 1 Age
                </label>

                <input
                  type="number"
                  id="applicant1age"
                  name="applicant1age"
                  min="18"
                  max="100"
                  step="1"
                  inputMode="numeric"
                  placeholder="18-100"
                  value={applicant1Age}
                  onChange={(e) =>
                    handleAgeChange(
                      e.target.value,
                      setApplicant1Age
                    )
                  }
                />

                <span className="hint">
                  Must be between 18 and 100.
                </span>
              </div>

              <div className="field">
                <label htmlFor="applicant1coverhistory">
                  Applicant 1 Cover History
                </label>

                <select
                  id="applicant1coverhistory"
                  value={applicant1CoverHistory}
                  onChange={(e) =>
                    setApplicant1CoverHistory(e.target.value)
                  }
                >
                  <option value="">
                    -- Select Cover History --
                  </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="not sure">Not sure</option>
                </select>
                <span className="hint">
                  Lifetime Health Cover loading applies to people over the age of 30, and only to hospital cover. It does not apply to extras cover. 
                </span>

              </div>

              {isTwoAdultCover && (
                <>
                  <div className="field">
                    <label htmlFor="applicant2age">
                      Applicant 2 Age
                    </label>

                    <input
                      type="number"
                      id="applicant2age"
                      name="applicant2age"
                      min="18"
                      max="100"
                      step="1"
                      inputMode="numeric"
                      placeholder="18-100"
                      value={applicant2Age}
                      onChange={(e) =>
                        handleAgeChange(
                          e.target.value,
                          setApplicant2Age
                        )
                      }
                    />

                    <span className="hint">
                      Must be between 18 and 100.
                    </span>
                  </div>

                  <div className="field">
                    <label htmlFor="applicant2coverhistory">
                      Applicant 2 Cover History
                    </label>

                    <select
                      id="applicant2coverhistory"
                      value={applicant2CoverHistory}
                      onChange={(e) =>
                        setApplicant2CoverHistory(e.target.value)
                      }
                    >
                      <option value="">
                        -- Select Cover History --
                      </option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                      <option value="not sure">Not sure</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="card">
            <h2>Cover Selection</h2>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="hospital-cover-select">
                  Hospital Cover
                </label>

                <select
                  id="hospital-cover-select"
                  value={selectedHospitalTier}
                  onChange={(e) =>
                    setSelectedHospitalTier(e.target.value)
                  }
                >
                  <option value="">
                    -- Choose a Hospital Tier --
                  </option>

                  {hospital_tiers.map((tier, index) => (
                    <option
                      key={index}
                      value={tier.hospital_cover}
                    >
                      {tier.hospital_cover} (${tier.pp_adult}/adult)
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="extra-cover-select">
                  Extras Cover
                </label>

                <select
                  id="extra-cover-select"
                  value={selectedExtraTier}
                  onChange={(e) =>
                    setSelectedExtraTier(e.target.value)
                  }
                >
                  <option value="">
                    -- Choose an Extras Tier --
                  </option>

                  {extra_tiers.map((tier, index) => (
                    <option
                      key={index}
                      value={tier.extras_cover}
                    >
                      {tier.extras_cover} (${tier.pp_adult}/adult)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="actions">
              <button onClick={nullInputCheck}>
                Display Total
              </button>

              {validationMessage && (
                <p className="error" role="alert">
                  {validationMessage}
                </p>
              )}
            </div>
          </section>

          {displayTotal && (
            <section className="card">
              <h2>Total</h2>

              <div className="results">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Family Coverage</th>
                      <th>Applicant 1 Age</th>
                      <th>Applicant 1 History</th>
                      <th>Applicant 2 Age</th>
                      <th>Applicant 2 History</th>
                      <th>Hospital</th>
                      <th>Extras</th>
                      <th>Payment</th>
                      <th>Cost</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentLog.map((record, index) => (
                      <tr key={record.id ?? index}>
                        <td>{record.customerName}</td>
                        <td>{record.selectedFamilyCoverage}</td>
                        <td>{record.applicant1Age}</td>
                        <td>{record.applicant1CoverHistory}</td>
                        <td>{record.applicant2Age || "-"}</td>
                        <td>{record.applicant2CoverHistory || "-"}</td>
                        <td>{record.selectedHospitalTier}</td>
                        <td>{record.selectedExtraTier}</td>
                        <td>{record.selectedPaymentFrequency}</td>
                        <td>${calculateCost(record).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <th colSpan="9">Total</th>
                      <th className="total">
                        ${totalCost.toFixed(2)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {currentLog.map((record, index) => {
                const calculation = calculateCostDetails(record);

                return (
                  <div
                    className="calculation"
                    key={`calculation-${record.id ?? index}`}
                  >
                    <h3>
                      Calculation for {record.customerName}
                    </h3>

                    <div className="calculation-row">
                      <span className="calculation-label">
                        Applicant 1 hospital cover
                      </span>
                      <span className="calculation-value">
                        ${calculation.applicant1Base.toFixed(2)}
                      </span>
                    </div>

                    {calculation.applicant1Loading > 0 && (
                      <div className="calculation-row">
                        <span className="calculation-label">
                          Applicant 1 age loading
                        </span>
                        <span className="calculation-value">
                          +{(calculation.applicant1Loading * 100).toFixed(0)}%
                          {" "}
                          ($
                          {(
                            calculation.applicant1Total -
                            calculation.applicant1Base
                          ).toFixed(2)}
                          )
                        </span>
                      </div>
                    )}

                    <div className="calculation-row">
                      <span className="calculation-label">
                        Applicant 1 total
                      </span>
                      <span className="calculation-value">
                        ${calculation.applicant1Total.toFixed(2)}
                      </span>
                    </div>

                    {calculation.adultCount === 2 && (
                      <>
                        <div className="calculation-row">
                          <span className="calculation-label">
                            Applicant 2 hospital cover
                          </span>
                          <span className="calculation-value">
                            ${calculation.applicant2Base.toFixed(2)}
                          </span>
                        </div>

                        {calculation.applicant2Loading > 0 && (
                          <div className="calculation-row">
                            <span className="calculation-label">
                              Applicant 2 age loading
                            </span>
                            <span className="calculation-value">
                              +
                              {(calculation.applicant2Loading * 100).toFixed(0)}
                              %
                              {" "}
                              ($
                              {(
                                calculation.applicant2Total -
                                calculation.applicant2Base
                              ).toFixed(2)}
                              )
                            </span>
                          </div>
                        )}

                        <div className="calculation-row">
                          <span className="calculation-label">
                            Applicant 2 total
                          </span>
                          <span className="calculation-value">
                            ${calculation.applicant2Total.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="calculation-row">
                      <span className="calculation-label">
                        Hospital cover total
                      </span>
                      <span className="calculation-value">
                        ${calculation.hospitalTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="calculation-row">
                      <span className="calculation-label">
                        Extras cover
                      </span>
                      <span className="calculation-value">
                        ${calculation.extrasTotal.toFixed(2)}
                      </span>
                    </div>

                    <div className="calculation-row">
                      <span className="calculation-label">
                        Family coverage fee
                      </span>
                      <span className="calculation-value">
                        ${calculation.familyFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="calculation-row">
                      <span className="calculation-label">
                        Monthly premium
                      </span>
                      <span className="calculation-value">
                        $
                        {calculation.monthlyPremium.toFixed(2)}
                      </span>
                    </div>

                    <div className="formula">
                      Hospital ($
                      {calculation.hospitalTotal.toFixed(2)}) + Extras ($
                      {calculation.extrasTotal.toFixed(2)}) + Family fee ($
                      {calculation.familyFee.toFixed(2)}) = Monthly premium ($
                      {calculation.monthlyPremium.toFixed(2)})
                    </div>

                    {record.selectedPaymentFrequency === "yearly" && (
                      <>
                        <div className="calculation-row">
                          <span className="calculation-label">
                            Annual price before discount
                          </span>
                          <span className="calculation-value">
                            $
                            {(calculation.monthlyPremium * 12).toFixed(2)}
                          </span>
                        </div>

                        <div className="calculation-row">
                          <span className="calculation-label">
                            5% annual discount
                          </span>
                          <span className="calculation-value">
                            -${calculation.discount.toFixed(2)}
                          </span>
                        </div>

                        <div className="formula">
                          ($
                          {calculation.monthlyPremium.toFixed(2)} × 12) − $
                          {calculation.discount.toFixed(2)} = $
                          {calculation.finalTotal.toFixed(2)}
                        </div>
                      </>
                    )}

                    <div className="calculation-row calculation-total">
                      <span>
                        Final {record.selectedPaymentFrequency} cost
                      </span>
                      <span>
                        ${calculation.finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
