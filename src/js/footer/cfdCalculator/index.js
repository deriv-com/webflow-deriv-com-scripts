if (window.location.pathname == "") {
  //User Inputs
  const volumeInLots = document.getElementById("");
  const assetPrice = document.getElementById("");
  //Display felids to be populated on symbol selection
  const contractSize = document.getElementById("");
  const leverage = document.getElementById("");
  const pipSize = document.getElementById("");
  const pointSize = document.getElementById("");
  const threeDaySwap = document.getElementById("");
  const weekendSwap = document.getElementById("");
  const swapLongRate = documeent.getElementById("");
  const swapShortRate = document.getElementById("");
  //Display fields to be calculated on submit
  const pipValue = document.getElementById("");
  const tradeVolume = document.getElementById("");
  const swapChargeLong = document.getElementById("");
  const swapChargeShort = document.getElementById("");
  const marginRequired = document.getElementById("");
  //intractable felids
  const symbolsField = document.getElementById("");
  const submitBtn = document.getElementById("");

  const resetBtn = document.getElementById("");

  resetBtn.addEventListener("click", function () {
    volumeInLots.innerHTML = "";
    assetPrice.innerHTML = "";
    contractSize.innerHTML = "-";
    leverage.innerHTML = "-";
    pipSize.innerHTML = "-";
    pointSize.innerHTML = "-";
    marginRequired.innerHTML = "-";
    tradeVolume.innerHTML = "-";
    pipValue.innerHTML = "-";
    swapChargeLong.innerHTML = "-";
    swapChargeShort.innerHTML = "-";
    threeDaySwap.innerHTML = "-";
    weekendSwap.innerHTML = "-";
    swapLongRate.innerHTML = "";
    swapShortRate.innerHTML = "";
  });

  //Adding event for when symbols dropdown will appear

  symbolsField.addEventListener("change", calculateInitialDisplayFeilds);

  //data holding variables for use in logical functions
  let allSymbols = [];
  let selectedSymbol = {};

  submitBtn.addEventListener("click", calculateFields);

  window
    .socketMessageSend(
      JSON.stringify({
        trading_platform_asset_listing: 1,
        platform: "mt5",
        account_type: "real",
        landing_company_short: "bvi",
        market_type: "financial",
        server: "p01_ts01",
        sub_account_category: "",
        sub_account_type: "financial",
        requested_fields: ["symbol"],
        unique: true,
      }),
      "trading_platform_asset_listing"
    )
    .then((data) => {
      allSymbols = data.trading_platform_asset_listing.mt5.assets;
      allSymbols.map((symb) => {
        let opt = document.createElement("option");
        opt.value = symb.description;
        opt.innerHTML = symb.description;
        symbolsField.appendChild(opt);
      });
    });

  const filterSymbols = (searchFeild = () => {
    const filteredData = allSymbols.filter((item) => {
      if (item.description.includes(item)) {
        return item;
      }
    });
    populateSymbol(filterSymbols);
  });

  const populateSymbol = (data) => {};

  const calculateInitialDisplayFeilds = () => {
    const selectSymb
    contractSize.innerHTML = selectedSymbol.contract_size;
    let pip = 10 ** -selectedSymbol.digits;
    pipSize.innerHTML = pip;
    pointSize.innerHTML = pip;
    leverage.innerHTML = selectedSymbol.effective_leverage_long_at_one;
    let weekdays = getActiveWeekdays(
      selectedSymbol.swap_rate_per_weekday.slice(1, 6)
    );
    let weekends = getActiveWeekEnds([
      selectedSymbol.swap_rate_per_weekday[0],
      selectedSymbol.swap_rate_per_weekday[6],
    ]);
    threeDaySwap.innerHTML = weekdays.length > 0 ? weekdays : "No";
    weekendSwap.innerHTML = weekends.length > 0 ? weekends : "No";
    swapLongRate.innerHTML = selectedSymbol.swap_long_per_lot;
    swapShortRate.innerHTML = selectedSymbol.swap_short_per_lot;
  };

  function getActiveWeekdays(weekdaysArray) {
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const activeDays = weekdaysArray
      .map((value, index) => (value > 1 ? weekdays[index] : null))
      .filter((day) => day !== null);
    return activeDays.join(", ");
  }

  function getActiveWeekEnds(weekEndArray) {
    const weekdays = ["Saturday", "Sunday"];
    const activeDays = weekEndArray
      .map((value, index) => (value === 1 ? weekdays[index] : null))
      .filter((day) => day !== null);
    return activeDays.join(", ");
  }

  const calculateFields = () => {
    let convertedRate = 0;
    window
      .socketMessageSend(
        JSON.stringify({
          exchange_rates: 1,
          base_currency: "USD",
        }),
        "exchange_rates"
      )
      .then((data) => {
        convertedRate =
          1 / data.exchange_rates.rates[selectedSymbol.profit_currency];
        let marginVolume = 0;
        let margin =
          marginVolume / selectedSymbol.effective_leverage_long_at_one;
        let tradeVol =
          pipSize.value *
          volumeInLots *
          selectedSymbol.contract_size *
          convertedRate;
        let swapLong =
          volumeInLots *
          selectedSymbol.contract_size *
          pipSize.value *
          selectedSymbol.swap_long_per_lot *
          convertedRate;
        let swapShort =
          volumeInLots *
          selectedSymbol.contract_size *
          pipSize.value *
          selectedSymbol.swap_short_per_lot *
          convertedRate;
        let pipVal =
          pipSize.value *
          volumeInLots *
          selectedSymbol.contract_size *
          convertedRate;

        if (selectedSymbol.calc_mode == "forex") {
          marginVolume =
            volumeInLots * selectedSymbol.contract_size * convertedRate;
        } else {
          marginVolume =
            volumeInLots *
            selectedSymbol.contract_size *
            assetPrice *
            convertedRate;
        }
        marginRequired.innerHTML = margin;
        pipValue.innerHTML = pipVal;
        swapChargeLong.innerHTML = swapLong;
        swapChargeShort.innerHTML = swapShort;
        tradeVolume.innerHTML = tradeVol;
      });
  };
}
