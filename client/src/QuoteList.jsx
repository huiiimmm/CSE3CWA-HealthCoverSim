import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { calculateCostDetails, calculateCost, toCalculatorRecord } from "./calculateCostDetails";

function QuoteList() {
  const navigate = useNavigate();

  const [currentLog, setCurrentLog] = useState([]);

  const [quotes, setQuotes] = useState([]);
  const [hospital_tiers, setHospital_tiers] = useState([]);
  const [extra_tiers, setExtra_tiers] = useState([]);
  const [family_coverage, setFamily_coverage] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadQuotes = async () => {
    try {
      const response = await fetch("/api/user_selections");
      if (!response.ok) {
        throw new Error(
          `User selections HTTP error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log("API /api/user_selections response:", data);

      let records = [];

      if (Array.isArray(data)) {
        records = data;
      } else if (Array.isArray(data.user_selections)) {
        records = data.user_selections;
      } else if (Array.isArray(data.data)) {
        records = data.data;
      } else if (Array.isArray(data.records)) {
        records = data.records;
      } else if (Array.isArray(data.quotes)) {
        records = data.quotes;
      }

      console.log("Quote records:", records);

      setQuotes(records);
    } catch (error) {
      console.error("Failed to load quotes:", error);

      setErrorMessage(
        "Unable to load quotes from the database."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    const loadPricingData = async () => {
      try {
        const [
          hospitalResponse,
          extraResponse,
          familyResponse,
        ] = await Promise.all([
          fetch("/api/hospital_tiers"),
          fetch("/api/extra_tiers"),
          fetch("/api/family_coverage"),
        ]);

        if (hospitalResponse.ok) {
          const data = await hospitalResponse.json();

          setHospital_tiers(
            Array.isArray(data) ? data : []
          );
        }

        if (extraResponse.ok) {
          const data = await extraResponse.json();

          setExtra_tiers(
            Array.isArray(data) ? data : []
          );
        }

        if (familyResponse.ok) {
          const data = await familyResponse.json();

          setFamily_coverage(
            Array.isArray(data) ? data : []
          );
        }
      } catch (error) {
        console.error(
          "Failed to load pricing data:",
          error
        );
      }
    };

    loadPricingData();
  }, []);

  const getCalculation = (quote) => {
  return calculateCostDetails(
    toCalculatorRecord(quote),
    hospital_tiers,
    extra_tiers,
    family_coverage
    );
  };

  const getCustomerName = (quote) => quote.customer_name;
  const getFamilyCoverage = (quote) => quote.cover_type;
  const getApplicant1Age = (quote) => quote.applicant1_age;
  const getApplicant1History = (quote) => quote.applicant_1_cover_history;
  const getApplicant2Age = (quote) => quote.applicant_2_age ?? "N/A";
  const getApplicant2History = (quote) => quote.applicant_2_cover_history ?? "N/A";
  const getHospitalTier = (quote) => quote.hospital_cover;
  const getExtraTier = (quote) => quote.extras_cover;
  const getPaymentFrequency = (quote) => quote.payment_frequency;
  const getQuoteId = (quote) => quote.id;

  const filteredQuotes = quotes.filter((quote) => {
    const search = searchTerm.trim().toLowerCase();

    const customerName =
      String(getCustomerName(quote)).toLowerCase();

    const familyCoverage =
      String(getFamilyCoverage(quote)).toLowerCase();

    const hospitalTier =
      String(getHospitalTier(quote)).toLowerCase();

    const extraTier =
      String(getExtraTier(quote)).toLowerCase();

    const paymentFrequency =
      String(getPaymentFrequency(quote)).toLowerCase();

    const matchesSearch =
      !search ||
      customerName.includes(search) ||
      familyCoverage.includes(search) ||
      hospitalTier.includes(search) ||
      extraTier.includes(search);

    const matchesPayment =
      !paymentFilter ||
      paymentFrequency ===
        paymentFilter.toLowerCase();

    return matchesSearch && matchesPayment;
  });

  const totalValue = filteredQuotes.reduce(
    (total, quote) =>
      total + getCalculation(quote).finalTotal,
    0
  );

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/user_selections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP error, status: ${res.status}`);
      setCurrentLog((prev) => prev.filter((record) => record.id !== id));
      await loadQuotes();
    } catch (error) {
      console.error("Failed to delete quote:", error);
    }
  };

  const handleEdit = (quote) => {
    const id = getQuoteId(quote);

    if (!id) {
      console.error(
        "Cannot edit quote because no ID was found:",
        quote
      );

      return;
    }

    navigate(`/edit/${id}`);
  };

  return (
    <div className="quotes-app">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f3f6fa;
          color: #172033;
        }

        .quotes-app {
          min-height: 100vh;
        }

        .container {
          width: min(1250px, calc(100% - 32px));
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

        .filters {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
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
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #2875c7;
          box-shadow: 0 0 0 3px rgba(40, 117, 199, 0.14);
        }

        .summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 16px;
        }

        .summary p {
          margin: 0;
          color: #65748b;
        }

        .summary strong {
          color: #1769aa;
          font-size: 1.2rem;
        }

        .results {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1280px;
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

        .cost {
          color: #1769aa;
          font-weight: 800;
        }

        .steps {
          min-width: 210px;
          padding: 10px;
          background: #f8fafc;
          border: 1px solid #e5eaf0;
          border-radius: 8px;
          white-space: normal;
        }

        .steps div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 3px 0;
          color: #526277;
        }

        .steps .final {
          margin-top: 5px;
          padding-top: 7px;
          border-top: 1px solid #dbe2ea;
          color: #1769aa;
          font-weight: 800;
        }

        .edit-button {
          border: 0;
          border-radius: 7px;
          padding: 9px 15px;
          background: #e8f1fb;
          color: #1769aa;
          font-weight: 700;
          cursor: pointer;
        }

        .edit-button:hover {
          background: #d9e9f8;
        }

        .loading,
        .empty,
        .error {	
          padding: 30px 10px;
          text-align: center;
        }

        .loading,
        .empty {
          color: #65748b;
        }

        .error {
          color: #a12828;
          font-weight: 600;
        }

        @media (max-width: 700px) {
          .container {
            width: min(100% - 20px, 1250px);
            padding-top: 22px;
          }

          .card {
            padding: 18px;
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .summary {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <main className="container">
	<button onClick={() => navigate("/")}>Go Back</button>
        <header className="header">
          <h1>Customer Quotes</h1>

          <p>
            View all customer quotes and their
            calculated premiums.
          </p>
        </header>

        <section className="card">
          <div className="filters">
            <div className="field">
              <label htmlFor="quote-search">
                Search Quotes
              </label>

              <input
                id="quote-search"
                type="search"
                placeholder="Search customer or cover..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="payment-filter">
                Payment Frequency
              </label>

              <select
                id="payment-filter"
                value={paymentFilter}
                onChange={(e) =>
                  setPaymentFilter(e.target.value)
                }
              >
                <option value="">All</option>
                <option value="monthly">
                  Monthly
                </option>
                <option value="yearly">
                  Yearly
                </option>
              </select>
            </div>
          </div>
        </section>

        <section className="card">
          {loading ? (
            <div className="loading">
              Loading quotes...
            </div>
          ) : errorMessage ? (
            <div className="error">
              {errorMessage}
            </div>
          ) : quotes.length === 0 ? (
            <div className="empty">
              No quote records were returned from
              the database.
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="empty">
              No quotes match your search.
            </div>
          ) : (
            <>
              <div className="summary">
                <p>
                  Showing {filteredQuotes.length} of{" "}
                  {quotes.length} quotes
                </p>
              </div>

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
                      <th>Calculation</th>
                      <th>Final Cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredQuotes.map(
                      (quote, index) => {
                        const calculation = calculateCostDetails(toCalculatorRecord(quote), hospital_tiers, extra_tiers, family_coverage);
                        return (
                          <tr key={getQuoteId(quote) ?? index}>
                            <td>
                              {getCustomerName(quote)}
                            </td>

                            <td>
                              {getFamilyCoverage(quote)}
                            </td>

                            <td>
                              {getApplicant1Age(quote)}
                            </td>

                            <td>
                              {getApplicant1History(quote)}
                            </td>

                            <td>
                              {getApplicant2Age(quote)}
                            </td>

                            <td>
                              {getApplicant2History(quote)}
                            </td>

                            <td>
                              {getHospitalTier(quote)}
                            </td>

                            <td>
                              {getExtraTier(quote)}
                            </td>

                            <td>
                              {getPaymentFrequency(quote)}
                            </td>
			<td>
			  <div className="steps">
			    <div className="steps">
			      <span>Applicant 1 hospital cover</span>
			      <span>${calculation.applicant1Base.toFixed(2)}</span>
			    </div>
	
			    {calculation.applicant1Loading > 0 && (
			      <div className="steps">
			        <span>Applicant 1 age loading</span>
			        <span>
			          +{(calculation.applicant1Loading * 100).toFixed(0)}%
			          (${(calculation.applicant1Total - calculation.applicant1Base).toFixed(2)})
			        </span>
			      </div>
			    )}

			    <div className="steps">
			      <span>Applicant 1 total</span>
			      <span>${calculation.applicant1Total.toFixed(2)}</span>
			    </div>

			    {getFamilyCoverage(quote) !== "single" && (
			      <>
			        <div className="steps">
			          <span>Applicant 2 hospital cover</span>
			          <span>${calculation.applicant2Base.toFixed(2)}</span>
			        </div>

			        {calculation.applicant2Loading > 0 && (
			          <div className="steps">
			            <span>Applicant 2 age loading</span>
			            <span>
			              +{(calculation.applicant2Loading * 100).toFixed(0)}%
			              (${(calculation.applicant2Total - calculation.applicant2Base).toFixed(2)})
			            </span>
			          </div>
			        )}

			        <div className="steps">
			          <span>Applicant 2 total</span>
			          <span>${calculation.applicant2Total.toFixed(2)}</span>
			        </div>
			      </>
			    )}

			    <div className="steps">
			      <span>Hospital cover total</span>
			      <span>${calculation.hospitalTotal.toFixed(2)}</span>
			    </div>

			    <div className="steps">
			      <span>Extras cover</span>
			      <span>${calculation.extrasTotal.toFixed(2)}</span>
			    </div>

			    <div className="steps">
			      <span>Family coverage fee</span>
			      <span>${calculation.familyFee.toFixed(2)}</span>
			    </div>

			    <div className="steps">
			      <span>Monthly premium</span>
			      <span>${calculation.monthlyPremium.toFixed(2)}</span>
			    </div>

			    <div className="formula">
			      Hospital (${calculation.hospitalTotal.toFixed(2)}) +
			      Extras (${calculation.extrasTotal.toFixed(2)}) +
			      Family fee (${calculation.familyFee.toFixed(2)})
			      = Monthly premium (${calculation.monthlyPremium.toFixed(2)})
			    </div>

			    {quote.payment_frequency === "yearly" && (
			      <>
			        <div className="steps">
			          <span>Annual price before discount</span>
			          <span>${(calculation.monthlyPremium * 12).toFixed(2)}</span>
			        </div>

			        {calculation.discount > 0 && (
			          <div className="steps">
			            <span>Annual discount ({(quote.annual_discount * 100).toFixed(0)}%)</span>
			            <span>-${calculation.discount.toFixed(2)}</span>
			          </div>
			        )}

			        <div className="formula">
			          (${calculation.monthlyPremium.toFixed(2)} × 12) − ${calculation.discount.toFixed(2)} = ${calculation.finalTotal.toFixed(2)}
			        </div>
			      </>
			    )}

			    <div className="steps final">
			      <span>Final {quote.payment_frequency} cost</span>
			      <span>
				${calculation.finalTotal.toFixed(2)}
			      </span>
			    </div>
			  </div>
			</td>
			<td className="cost">${calculation.finalTotal.toFixed(2)}</td>
			<td>
			  <button type="button" className="edit-button" onClick={() => handleEdit(quote)}>
			    Edit
			  </button>
                          <button type="button" className="delete-button" onClick={() => handleDelete(quote.id)}>
                            Delete
                          </button>
			</td>                          
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default QuoteList;

