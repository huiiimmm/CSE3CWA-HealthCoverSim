export const calculateCostDetails = (
  record,
  hospital_tiers=[],
  extra_tiers=[],
  family_coverage=[]
) => {
  const hospitalCover = hospital_tiers.find(
    (tier) =>
      tier.hospital_cover?.toLowerCase() ===
      record.hospital_cover?.toLowerCase()
  );

  const extraCover = extra_tiers.find(
    (tier) =>
      tier.extras_cover?.toLowerCase() ===
      record.extras_cover?.toLowerCase()
  );

  const familyCover = family_coverage.find(
    (tier) =>
      tier.cover_type?.toLowerCase() ===
      record.cover_type?.toLowerCase()
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
    record.selectedFamilyCoverage?.toLowerCase() === "family" ||
    record.selectedFamilyCoverage?.toLowerCase() === "couple"
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
    adultCount === 2
      ? Number(hospitalCover.pp_adult)
      : 0;

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

  const annualDiscount = 
    Number(record.annual_discount) || 0;

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

export const calculateCost = (
  record,
  hospital_tiers,
  extra_tiers,
  family_coverage
) => {
  return calculateCostDetails(
    record,
    hospital_tiers,
    extra_tiers,
    family_coverage
  ).finalTotal;
};

