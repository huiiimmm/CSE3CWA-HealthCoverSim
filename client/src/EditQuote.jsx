import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

function EditQuote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [hospital_tiers, setHospital_tiers] = useState([]);
  const [extra_tiers, setExtra_tiers] = useState([]);
  const [family_coverage, setFamily_coverage] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [coverType, setCoverType] = useState("");
  const [applicant1Age, setApplicant1Age] = useState("");
  const [applicant1CoverHistory, setApplicant1CoverHistory] = useState("");
  const [applicant2Age, setApplicant2Age] = useState("");
  const [applicant2CoverHistory, setApplicant2CoverHistory] = useState("");
  const [hospitalCover, setHospitalCover] = useState("");
  const [extrasCover, setExtrasCover] = useState("");
  const [paymentFrequency, setPaymentFrequency] = useState("");
  const [annualDiscount, setAnnualDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isTwoAdultCover =
    coverType.toLowerCase() === "couple" || coverType.toLowerCase() === "family";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          quoteResponse,
          hospitalResponse,
          extraResponse,
          familyResponse,
        ] = await Promise.all([
          fetch(`/api/user_selections/${id}`),
          fetch("/api/hospital_tiers"),
          fetch("/api/extra_tiers"),
          fetch("/api/family_coverage"),
        ]);

        if (!quoteResponse.ok) {
          throw new Error(
            `Quote HTTP error: ${quoteResponse.status}`
          );
        }

        const quote = await quoteResponse.json();

        setCustomerName(quote.customer_name ?? "");
        setCoverType(quote.cover_type ?? "");
        setApplicant1Age(quote.applicant1_age ?? "");
        setApplicant1CoverHistory(quote.applicant_1_cover_history ?? "");
        setApplicant2Age(quote.applicant_2_age ?? "");
        setApplicant2CoverHistory(quote.applicant_2_cover_history ?? "");
        setHospitalCover(quote.hospital_cover ?? "");
        setExtrasCover(quote.extras_cover ?? "");
        setPaymentFrequency(quote.payment_frequency ?? "");
        setAnnualDiscount(quote.annual_discount * 100 ?? 0);
        setNotes(quote.notes ?? "");

        if (hospitalResponse.ok) {
          const data = await hospitalResponse.json();
          setHospital_tiers(Array.isArray(data) ? data : []);
        }

        if (extraResponse.ok) {
          const data = await extraResponse.json();
          setExtra_tiers(Array.isArray(data) ? data : []);
        }

        if (familyResponse.ok) {
          const data = await familyResponse.json();
          setFamily_coverage(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load quote:", error);
        setErrorMessage("Unable to load this quote.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!customerName.trim()) {
      alert("Please enter a customer name.");
      return;
    }

    if (
      !Number.isInteger(Number(applicant1Age)) ||
      Number(applicant1Age) < 18 || Number(applicant1Age) > 100
    ) {
      alert("Applicant 1 age must be between 18 and 100.");
      return;
    }

    if (
      isTwoAdultCover &&
      (!Number.isInteger(Number(applicant2Age)) ||
        Number(applicant2Age) < 18 || Number(applicant2Age) > 100)
    ) {
      alert("Applicant 2 age must be between 18 and 100.");
      return;
    }

    if (
      !applicant1CoverHistory ||
      (isTwoAdultCover && !applicant2CoverHistory)
    ) {
      alert("Please select cover history.");
      return;
    }

    if (
      !coverType ||
      !hospitalCover ||
      !extrasCover ||
      !paymentFrequency
    ) {
      alert("Please complete all required fields.");
      return;
    }

    const updatedQuote = {
      customer_name: customerName.trim(),
      cover_type: coverType.trim().toLowerCase(),
      applicant1_age: Number(applicant1Age),
      applicant_1_cover_history: applicant1CoverHistory.toLowerCase(),
      applicant_2_age: isTwoAdultCover ? Number(applicant2Age) : null,
      applicant_2_cover_history: isTwoAdultCover ? applicant2CoverHistory.toLowerCase() : null,
      hospital_cover: hospitalCover.trim(),
      extras_cover: extrasCover.trim(),
      payment_frequency: paymentFrequency.trim().toLowerCase(),
      annual_discount: Number(annualDiscount)/100 || 0,
      notes: notes.trim(),
    };

    try {
      setSaving(true);

      const response = await fetch(
        `/api/user_selections/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedQuote),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Update HTTP error: ${response.status}`
        );
      }

      navigate("/quote-list");
    } catch (error) {
      console.error("Failed to update quote:", error);

      setErrorMessage(
        "Unable to save the quote."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-page">
        <div className="edit-container">
          <p>Loading quote...</p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="edit-page">
        <div className="edit-container">
          <p className="error">{errorMessage}</p>

          <button
            type="button"
            onClick={() => navigate("/quotes")}
          >
            Back to Quotes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-page">
      <div className="edit-container">
        <header className="page-header">
          <h1>Edit Quote</h1>

          <p>
            Update the customer information and
            cover selections below.
          </p>
        </header>

        <form
          className="edit-card"
          onSubmit={handleSave}
        >
          <div className="field">
            <label htmlFor="customer-name">
              Customer Name
            </label>

            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="cover-type">
              Family Coverage
            </label>

            <select
              id="cover-type"
              value={coverType}
              onChange={(e) => {
                setCoverType(e.target.value);

                if (
                  e.target.value !== "couple" &&
                  e.target.value !== "family"
                ) {
                  setApplicant2Age("");
                  setApplicant2CoverHistory("");
                }
              }}
              required
            >
              <option value="">
                -- Select Coverage --
              </option>

              {family_coverage.map(
                (tier, index) => (
                  <option
                    key={index}
                    value={tier.cover_type}
                  >
                    {tier.cover_type}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="field">
            <label htmlFor="applicant1-age">
              Applicant 1 Age
            </label>

            <input
              id="applicant1-age"
              type="number"
              min="18"
              max="100"
              value={applicant1Age}
              onChange={(e) =>
                setApplicant1Age(e.target.value)
              }
              required
            />
          </div>

          <div className="field">
            <label htmlFor="applicant1-history">
              Applicant 1 Cover History
            </label>

            <select
              id="applicant1-history"
              value={applicant1CoverHistory}
              onChange={(e) =>
                setApplicant1CoverHistory(
                  e.target.value
                )
              }
              required
            >
              <option value="">
                -- Select History --
              </option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="not sure">
                Not Sure
              </option>
            </select>
          </div>

          {isTwoAdultCover && (
            <>
              <div className="field">
                <label htmlFor="applicant2-age">
                  Applicant 2 Age
                </label>

                <input
                  id="applicant2-age"
                  type="number"
                  min="18"
                  max="100"
                  value={applicant2Age}
                  onChange={(e) =>
                    setApplicant2Age(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="applicant2-history">
                  Applicant 2 Cover History
                </label>

                <select
                  id="applicant2-history"
                  value={applicant2CoverHistory}
                  onChange={(e) =>
                    setApplicant2CoverHistory(
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    -- Select History --
                  </option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="not sure">
                    Not Sure
                  </option>
                </select>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="hospital-cover">
              Hospital Cover
            </label>

            <select
              id="hospital-cover"
              value={hospitalCover}
              onChange={(e) =>
                setHospitalCover(e.target.value)
              }
              required
            >
              <option value="">
                -- Select Hospital Cover --
              </option>

              {hospital_tiers.map(
                (tier, index) => (
                  <option
                    key={index}
                    value={tier.hospital_cover}
                  >
                    {tier.hospital_cover} ($
                    {tier.pp_adult}/adult)
                  </option>
                )
              )}
            </select>
          </div>

          <div className="field">
            <label htmlFor="extras-cover">
              Extras Cover
            </label>

            <select
              id="extras-cover"
              value={extrasCover}
              onChange={(e) =>
                setExtrasCover(e.target.value)
              }
              required
            >
              <option value="">
                -- Select Extras Cover --
              </option>

              {extra_tiers.map(
                (tier, index) => (
                  <option
                    key={index}
                    value={tier.extras_cover}
                  >
                    {tier.extras_cover} ($
                    {tier.pp_adult}/adult)
                  </option>
                )
              )}
            </select>
          </div>

          <div className="field">
            <label htmlFor="payment-frequency">
              Payment Frequency
            </label>

            <select
              id="payment-frequency"
              value={paymentFrequency}
              onChange={(e) =>
                setPaymentFrequency(
                  e.target.value
                )
              }
              required
            >
              <option value="">
                -- Select Frequency --
              </option>
              <option value="monthly">
                Monthly
              </option>
              <option value="yearly">
                Yearly
              </option>
            </select>
          </div>
	  
	  <div className="field">
	    <label htmlFor="notes">Annual Discount(in %)</label>
                <input
                  id="annual-discount"
                  type="number"
                  min="1"
                  max="10"
                  value={annualDiscount}
                  onChange={(e) =>
                    setAnnualDiscount(
                      e.target.value
                    )
                  }
                  required
                />

	  </div>

          <div className="field">
            <label htmlFor="notes">
              Notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              rows="4"
            />
          </div>

          <div className="actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/quote-list")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, system-ui, sans-serif;
          background: #f3f6fa;
          color: #172033;
        }

        .edit-page {
          min-height: 100vh;
        }

        .edit-container {
          width: min(720px, calc(100% - 32px));
          margin: 0 auto;
          padding: 40px 0 60px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          margin: 0 0 8px;
          color: #173b68;
        }

        .page-header p {
          margin: 0;
          color: #65748b;
        }

        .edit-card {
          display: grid;
          gap: 18px;
          background: white;
          border: 1px solid #e1e7ef;
          border-radius: 14px;
          padding: 28px;
          box-shadow: 0 5px 18px rgba(20, 40, 70, 0.05);
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
        select,
        textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: white;
          color: #172033;
          font: inherit;
        }

        input,
        select {
          min-height: 44px;
        }

        textarea {
          resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #2875c7;
          box-shadow:
            0 0 0 3px
            rgba(40, 117, 199, 0.14);
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding-top: 8px;
        }

        button {
          border: 0;
          border-radius: 8px;
          padding: 11px 18px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-button {
          background: #eef2f6;
          color: #44546a;
        }

        .save-button {
          background: #1769aa;
          color: white;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          color: #a12828;
          margin-bottom: 16px;
        }

        @media (max-width: 600px) {
          .edit-container {
            width: min(100% - 20px, 720px);
            padding-top: 24px;
          }

          .edit-card {
            padding: 20px;
          }

          .actions {
            flex-direction: column-reverse;
          }

          button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default EditQuote;
