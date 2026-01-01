/*

MIT License

Copyright (c) 2022 Neatnik LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

var NEATOCAL_PARAM = {

  // experiments with filling in data in cells
  //
  "data_fn": "",

  "data": { },

  "color_cell": [],

  // Putting data in cells can alter the cell/row height,
  // so we allow a user parameter to fiddle with cell height.
  // The parameter here is directly applied to the `tr` style,
  // so values of "1.5em" or "30px" will work.
  //
  "cell_height": "",

  // show info/help screen
  //
  "help" : false,

  // for aligned-weekdays, which day to start (0 indexed)
  //
  //   Monday (1) default
  //
  "start_day": 1,

  // calendar format
  //
  //   default
  //   aligned-weekdays
  //
  "format": "default",

  // year to start
  //
  //   default this year
  //
  "year": new Date().getFullYear(),

  // Text to use for displaying weekdays
  //
  "weekday_code" : [ "Su", "M", "T", "W", "R", "F", "Sa"  ],

  // Weekday representation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#weekday
  //
  //   long
  //   short
  //   narrow
  //
  "weekday_format": "short",

  // text to sue for month header
  //
  "month_code": [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],

  // Month representation https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#month
  //
  //   numeric
  //   2-digit
  //   long
  //   short
  //   narrow
  //
  "month_format": "short",

  // weekend days (0=Sun, 1=Mon, ..., 5=Fri, 6=Sat)
  // Default Sunday Monday.
  //
  "weekend_days": [ 0, 6 ],

  //
  "language" : "",

  // start month (0 indexed)
  //
  //   Janurary (0) default
  //
  "start_month" : 0,

  // number of months to go out to
  //
  "n_month" : 12,

  // weekend highlight color
  //
  "highlight_color": '#eee',

  // today's date highlight color
  //
  "today_highlight_color": '',

  // Moon phase display options
  //
  "show_moon_phase": false,
  "moon_phase_style": "css",  // "css", "symbol", "name"
  "moon_phase_position": "below",  // "below", "inline"
  "moon_phase_display": "changes",  // "all", "changes"
  //
  // show week numbers
  //
  "show_week_numbers": false,

  // fiddly parameters
  //
  "year_font_size": undefined,
  "year_font_weight": undefined,
  "year_foreground_color": undefined,
  "year_background_color": undefined,

  "month_font_size": undefined,
  "month_font_weight": undefined,
  "month_foreground_color": undefined,
  "month_background_color": undefined,

  "weekday_font_size": undefined,
  "weekday_font_weight": undefined,
  "weekday_foreground_color": undefined,
  "weekday_background_color": undefined,

  "weekend_font_size": undefined,
  "weekend_font_weight": undefined,
  "weekend_foreground_color": undefined,
  "weekend_background_color": undefined,

  "week_font_size": undefined,
  "week_font_weight": undefined,
  "week_foreground_color": undefined,
  "week_background_color": undefined,

  "date_font_size": undefined,
  "date_font_weight": undefined,
  "date_foreground_color": undefined,
  "date_background_color": undefined,

  "weekend_date_font_size": undefined,
  "weekend_date_font_weight": undefined,
  "weekend_date_foreground_color": undefined,
  "weekend_date_background_color": undefined

};

// simple HTML convenience functions
//
var H = {
  "text": function(txt) { return document.createTextNode(txt); },
  "div": function() { return document.createElement("div"); },
  "tr": function() { return document.createElement("tr"); },
  "th": function(v) {
    let th = document.createElement("th");
    if (typeof v !== "undefined") { th.innerHTML = v; }
    return th;
  },
  "td": function() { return document.createElement("td"); },
  "span": function(v,_class) {
    let s = document.createElement("span");
    if (typeof v !== "undefined") { s.innerHTML = v; }
    if (typeof _class !== "undefined") { s.classList.add(_class); }
    return s;
  }
};

// Probably overkill but have parameters to fiddle with the weekend text, weekday text,
// date (day in month) text, month text, week number (if specified) and dates that fall
// on the weekend (day in month that are also weekends).
// Logic is in each of the render functions but the idea is that date stylings happens
// first then weekend_date stylings are applied.
//
// ele is the HTML element that class stylings are being applied.
// _type is one of "weekend", "weekday", "date", "month", "week", "weekend_date"
//
// _type is checked for validity from the `valid_types` array.
// If not found, returns.
//
// If found, each of the parameter variables is enumerated by tacking on the suffix
// in the `sfx_param` array and testing to see if specified in the NEATOCAL_PARAM list.
// If found, the class stylings are applied to the HTML element using the `class_key`
// value specified.
//
function ele_styles(ele, _type) {
  let valid_type = ["weekend", "weekday", "date", "month", "week", "weekend_date", "year"];
  let sfx_param = [ "_font_size", "_font_weight", "_foreground_color", "_background_color"];
  let class_key = ["fontSize", "fontWeight", "color", "background"];

  let _t = "";
  for (let i=0; i<valid_type.length; i++) {
    if (valid_type[i] == _type) { _t = valid_type[i];  break; }
  }
  if (_t == "") { return; }

  for (let i=0; i<sfx_param.length; i++) {
    let _param = _t + sfx_param[i];
    if ((_param in NEATOCAL_PARAM) &&
        (typeof NEATOCAL_PARAM[_param] !== "undefined")) {
      ele.style[class_key[i]] = NEATOCAL_PARAM[_param];
    }
  }

}

// for convenience, functions wrap the above meta function
//
function weekend_styles(weekend_ele) { ele_styles(weekend_ele, "weekend"); }
function weekday_styles(weekday_ele) { ele_styles(weekday_ele, "weekday"); }
function week_styles(week_ele) { ele_styles(week_ele, "week"); }
function date_styles(date_ele) { ele_styles(date_ele, "date"); }
function weekend_date_styles(weekend_date_ele) { ele_styles(weekend_date_ele, "weekend_date"); }
function month_styles(month_ele) { ele_styles(month_ele, "month"); }
function year_styles(year_ele) { ele_styles(year_ele, "year"); }



// Moon phase calculation functions
// Reference: Known new moon on Jan 6, 2000, 18:14 UTC (Julian Day 2451550.26)
//
function calculateLunarAge(year, month, day) {

  // Calculate days since reference new moon (Jan 6, 2000)
  //
  let refDate = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  let targetDate = new Date(Date.UTC(year, month, day, 0, 0, 0));

  let daysSince = (targetDate - refDate) / (1000 * 60 * 60 * 24);

  // Lunar synodic period (new moon to new moon)
  //
  let lunarCycle = 29.53058867;

  // Calculate lunar age (days since last new moon)
  //
  let lunarAge = daysSince % lunarCycle;
  if (lunarAge < 0) { lunarAge += lunarCycle; }

  return lunarAge;
}

function getMoonPhase(lunarAge) {

  // Returns phase index 0-7
  // 0: New Moon, 1: Waxing Crescent, 2: First Quarter, 3: Waxing Gibbous
  // 4: Full Moon, 5: Waning Gibbous, 6: Last Quarter, 7: Waning Crescent
  //
  let phase = Math.round((lunarAge / 29.53058867) * 8) % 8;

  return phase;
}

function getMoonIllumination(lunarAge) {
  // Returns illumination percentage 0-100
  let cycle = 29.53058867;
  let percent = ((1 - Math.cos((lunarAge / cycle) * 2 * Math.PI)) / 2) * 100;
  return Math.round(percent);
}

function getMoonPhaseName(phase) {
  const names = [
    "New", "Wax Cres", "First Qtr", "Wax Gibb",
    "Full", "Wan Gibb", "Last Qtr", "Wan Cres"
  ];
  return names[phase];
}

function getMoonPhaseSymbol(phase) {
  const symbols = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  return symbols[phase];
}

// Counter for unique mask IDs
//
var MOON_PHASE_COUNTER = 0;

function createMoonPhaseCSS(phase, lunarAge) {

  // Create an inline SVG moon phase visualization with unique mask IDs
  //
  let span = H.span("", "moon-phase");
  let uid = ++MOON_PHASE_COUNTER;

  // SVG moon phase definitions using masks for curved terminators
  //
  const svgs = [

    // 0: New Moon
    //
    "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><circle cx='32' cy='32' r='30' fill='#404040'/></svg>",

    // 1: Waxing Crescent
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m1-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='22' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m1-${uid})'/></svg>`,

    // 2: First Quarter
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m2-${uid}'><rect x='32' y='0' width='32' height='64' fill='white'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m2-${uid})'/></svg>`,

    // 3: Waxing Gibbous
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m3-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='42' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#d0d0d0'/><circle cx='32' cy='32' r='30' fill='#404040' mask='url(#m3-${uid})'/></svg>`,

    // 4: Full Moon
    //
    "<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><circle cx='32' cy='32' r='30' fill='#d0d0d0'/></svg>",

    // 5: Waning Gibbous
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m5-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='22' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#d0d0d0'/><circle cx='32' cy='32' r='30' fill='#404040' mask='url(#m5-${uid})'/></svg>`,

    // 6: Last Quarter (Third Quarter)
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m6-${uid}'><rect x='0' y='0' width='32' height='64' fill='white'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m6-${uid})'/></svg>`,

    // 7: Waning Crescent
    //
    `<svg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'><defs><mask id='m7-${uid}'><circle cx='32' cy='32' r='30' fill='white'/><circle cx='42' cy='32' r='30' fill='black'/></mask></defs><circle cx='32' cy='32' r='30' fill='#404040'/><circle cx='32' cy='32' r='30' fill='#d0d0d0' mask='url(#m7-${uid})'/></svg>`
  ];

  span.innerHTML = svgs[phase];
  return span;
}

function renderMoonPhase(td, year, month, day) {
  if (!NEATOCAL_PARAM.show_moon_phase) { return; }

  let lunarAge = calculateLunarAge(year, month, day);
  let phase = getMoonPhase(lunarAge);

  // If only showing phase changes, check if phase is different from previous day
  //
  if (NEATOCAL_PARAM.moon_phase_display === "changes") {

    // Calculate previous day
    //
    let prevDate = new Date(year, month, day - 1);
    let prevLunarAge = calculateLunarAge(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
    let prevPhase = getMoonPhase(prevLunarAge);

    // Skip if phase hasn't changed
    //
    if (phase === prevPhase) { return; }
  }

  let moonElement;

  if (NEATOCAL_PARAM.moon_phase_style === "symbol") {
    moonElement = H.span(getMoonPhaseSymbol(phase), "moon-symbol");
  }

  else if (NEATOCAL_PARAM.moon_phase_style === "name") {
    moonElement = H.span(getMoonPhaseName(phase), "moon-name");
  }

  else {

    // Default to CSS
    //
    moonElement = createMoonPhaseCSS(phase, lunarAge);
  }

  if (NEATOCAL_PARAM.moon_phase_position === "inline") {

    // Add inline after a space
    //
    moonElement.classList.add("moon-inline");
    td.appendChild(H.text(" "));
    td.appendChild(moonElement);
  }

  else {

    // Add below in its own container
    //
    let moonContainer = H.div();
    moonContainer.classList.add("moon-container");
    moonContainer.appendChild(moonElement);
    td.appendChild(moonContainer);
  }

}

function localized_day(locale, day_idx) {
  let iday = 17 + day_idx;
  let s = '1995-12-' + iday.toString() + 'T12:00:01Z';
  let d = new Date(s);
  return d.toLocaleDateString(locale, {"weekday":NEATOCAL_PARAM.weekday_format});
}

function localized_month(locale, mo_idx) {
  let imo = 1 + mo_idx;
  let imo_str = ((imo < 10) ? ("0" + imo.toString()) : imo.toString());
  let s = '1995-' + imo_str + '-18T12:00:01Z';
  let d = new Date(s);
  return d.toLocaleDateString(locale, {"month":NEATOCAL_PARAM.month_format});
}

function neatocal_hallon_almanackan() {
  let year      = NEATOCAL_PARAM.year;
  let start_mo  = NEATOCAL_PARAM.start_month;
  let n_mo      = NEATOCAL_PARAM.n_month;

  let ui_tr_mo = document.getElementById("ui_tr_month_name");
  ui_tr_mo.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let th_mo = H.th( NEATOCAL_PARAM.month_code[ i_mo%12 ] );
    month_styles(th_mo);
    ui_tr_mo.appendChild( th_mo );
  }

  // Precompute the parity of week the day falls on.
  // Calendar is month major order, making it more difficult
  // to calculate the parity of week the day falls in.
  //
  let week_parity = 0;
  let day_parity = {};
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {

    let cur_year = parseInt(year) + Math.floor(i_mo/12);
    let cur_mo = i_mo%12;
    let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();

    if (!(i_mo in day_parity)) {
      day_parity[i_mo] = {};
    }

    for (let day_idx=0; day_idx < 31; day_idx++) {
      if (day_idx >= nday_in_mo) { break; }

      day_parity[i_mo][day_idx] = week_parity;

      let dt = new Date(cur_year, cur_mo, day_idx+1);
      if (dt.getDay() == 0) {
        week_parity = 1-week_parity;
      }

    }
  }

  let tbody = document.getElementById("ui_tbody");
  for (let idx=0; idx<31; idx++) {

    let tr = H.tr();
    if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
        (NEATOCAL_PARAM.cell_height != null) &&
        (NEATOCAL_PARAM.cell_height != "")) {
      tr.style.height = NEATOCAL_PARAM.cell_height;
    }


    let cur_year = year;
    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {

      cur_year = parseInt(year) + Math.floor(i_mo/12);

      let cur_mo = i_mo%12;

      let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();

      let td = H.td();
      td.style.width = (100/n_mo).toString() + "%";

      td.id = "ui_" + fmt_date(cur_year, cur_mo+1, idx+1);

      if (idx < nday_in_mo) {

        let dt = new Date(cur_year, cur_mo, idx+1);

        let d = NEATOCAL_PARAM.weekday_code[ dt.getDay() ];

        if (day_parity[i_mo][idx]) {
          td.classList.add("weekend");
        }

        if ((dt.getDay() != 0) ||
            (idx == (nday_in_mo-1))) {
          td.style.borderBottom = '0';
        }


        let span_date = H.span((idx+1).toString(), "date");
        let span_day = H.span(d, "day");

        // If any param specified stylings apply, apply them.
        // Date stylings happen before weekend_date so that
        // the weekend_date, if specified, can override
        //

        date_styles(span_date);

        //if (dt.getDay() == 0) {
        if (NEATOCAL_PARAM.weekend_days.includes(dt.getDay())) {
          span_date.style.color = "rgb(230,37,7)";
          span_day.style.color = "rgb(230,37,7)";
          weekend_styles(span_day);
          weekend_date_styles(span_date);
        }

        else {
          weekday_styles(span_day);
        }

        td.appendChild( span_date );
        td.appendChild( span_day );

        if ((dt.getDay() == 1) && NEATOCAL_PARAM.show_week_numbers) {
          let span_week_no = H.span(getISOWeekNumber(dt), "date");
          span_week_no.style.float = "right";
          span_week_no.style.color = "rgb(230,37,7)";
          week_styles(span_week_no);
          td.appendChild(span_week_no);
        }

        let yyyy_mm_dd = fmt_date(cur_year, cur_mo+1, idx+1);
        if (yyyy_mm_dd in NEATOCAL_PARAM.data) {
          let txt = H.div();
          txt.innerHTML = NEATOCAL_PARAM.data[yyyy_mm_dd];
          txt.style.textAlign = "center";
          txt.style.fontWeight = "300";

          td.appendChild(txt);
        }

        // Add moon phase if enabled
        //
        renderMoonPhase(td, cur_year, cur_mo, idx+1);

      }
      tr.appendChild(td);

    }

    tbody.appendChild(tr);

  }

}

function neatocal_default() {
  let year      = NEATOCAL_PARAM.year;
  let start_mo  = NEATOCAL_PARAM.start_month;
  let n_mo      = NEATOCAL_PARAM.n_month;

  let ui_tr_mo = document.getElementById("ui_tr_month_name");
  ui_tr_mo.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let th_mo = H.th( NEATOCAL_PARAM.month_code[ i_mo%12 ] );
    month_styles(th_mo);
    ui_tr_mo.appendChild( th_mo );
  }

  let tbody = document.getElementById("ui_tbody");
  for (let idx=0; idx<31; idx++) {

    let tr = H.tr();
    if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
        (NEATOCAL_PARAM.cell_height != null) &&
        (NEATOCAL_PARAM.cell_height != "")) {
      tr.style.height = NEATOCAL_PARAM.cell_height;
    }


    let cur_year = year;
    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {

      cur_year = parseInt(year) + Math.floor(i_mo/12);

      let cur_mo = i_mo%12;

      let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();

      let td = H.td();
      td.style.width = (100/n_mo).toString() + "%";
      td.id = "ui_" + fmt_date(cur_year, cur_mo+1, idx+1);

      if (idx < nday_in_mo) {

        let dt = new Date(cur_year, cur_mo, idx+1);

        let d = NEATOCAL_PARAM.weekday_code[ dt.getDay() ];

        //if ((dt.getDay() == 0) ||
        //    (dt.getDay() == 6)) {
        if (NEATOCAL_PARAM.weekend_days.includes(dt.getDay())) {
          td.classList.add("weekend");
        }

        let span_date = H.span((idx+1).toString(), "date");
        let span_day = H.span(d, "day");

        // If any param specified stylings apply, apply them.
        // Date stylings happen before weekend_date so that
        // the weekend_date, if specified, can override
        //

        date_styles(span_date);

        if ((dt.getDay() == 0) ||
            (dt.getDay() == 6)) {
          weekend_styles(span_day);
          weekend_date_styles(span_date);
        }

        else {
          weekday_styles(span_day);
        }

        td.appendChild( span_date );
        td.appendChild( span_day );

        if ((dt.getDay() == 1) && NEATOCAL_PARAM.show_week_numbers) {
          let span_week_no = H.span(getISOWeekNumber(dt), "date");
          span_week_no.style.float = "right";
          span_week_no.style.color = "rgb(230,37,7)";
          week_styles(span_week_no);
          td.appendChild(span_week_no);
        }

        let yyyy_mm_dd = fmt_date(cur_year, cur_mo+1, idx+1);
        if (yyyy_mm_dd in NEATOCAL_PARAM.data) {
          let txt = H.div();
          txt.innerHTML = NEATOCAL_PARAM.data[yyyy_mm_dd];
          txt.style.textAlign = "center";
          txt.style.fontWeight = "300";
          td.appendChild(txt);
        }

        // Add moon phase if enabled
        //
        renderMoonPhase(td, cur_year, cur_mo, idx+1);

      }
      tr.appendChild(td);

    }

    tbody.appendChild(tr);

  }

}

function fmt_date(y,m,d) {
  let res = y.toString() + "-";
  if (m<10) {
    res += "0";
  }
  res += m.toString() + "-";
  if (d < 10) {
    res += "0";
  }
  res += d.toString();
  return res;
}

function getISOWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Set to nearest Thursday: current date + 4 - current day number (Mon=1, Sun=7)
  //

  // Convert Sunday from 0 to 7
  //
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);

  // Get first day of year
  //
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));

  // Calculate full weeks from year start to nearest Thursday
  //
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function neatocal_aligned_weekdays() {
  let year      = parseInt(NEATOCAL_PARAM.year);
  let start_mo  = parseInt(NEATOCAL_PARAM.start_month);
  let n_mo      = parseInt(NEATOCAL_PARAM.n_month);

  let ui_tr_mo = document.getElementById("ui_tr_month_name");
  ui_tr_mo.innerHTML = "";
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let th_mo = H.th( NEATOCAL_PARAM.month_code[ i_mo%12 ] );
    month_styles(th_mo);
    ui_tr_mo.appendChild( th_mo );
  }

  // start_day, when to start the first day in the month.
  // day_in_mo_start is the number of days past the start_day
  //   the month starts, so we know how much to skip over when
  //   displaying the aligned cells.
  //
  let max_start = -1;
  let start_day = NEATOCAL_PARAM.start_day;
  let day_in_mo_start = [];
  for (let i=0; i<n_mo; i++) { day_in_mo_start.push(0); }
  for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {
    let cur_year = parseInt(year) + Math.floor(i_mo/12);
    let cur_mo = i_mo%12;
    let s = new Date(cur_year, cur_mo, 1).getDay();
    day_in_mo_start[i_mo - start_mo] = s;

    if (day_in_mo_start[i_mo - start_mo] > max_start) {
      max_start = day_in_mo_start[i_mo - start_mo];
    }
  }

  let tbody = document.getElementById("ui_tbody");
  for (let idx=0; idx<42; idx++) {

    let tr = H.tr();
    if ((typeof NEATOCAL_PARAM.cell_height !== "undefined") &&
        (NEATOCAL_PARAM.cell_height != null) &&
        (NEATOCAL_PARAM.cell_height != "")) {
      tr.style.height = NEATOCAL_PARAM.cell_height;
    }

    let cur_year = year;
    for (let i_mo = start_mo; i_mo < (start_mo+n_mo); i_mo++) {

      cur_year = parseInt(year) + Math.floor(i_mo/12);

      // cur_mo is the month in the current year
      // nday_in_mo is the number of days in the month under consideration
      // day_idx is the day of the month this cell would fall in,
      //  which can be out of bounds (less than 0 or greater than the number of
      //  days in the month)
      //
      let cur_mo = i_mo%12;
      let nday_in_mo = new Date(cur_year,cur_mo+1,0).getDate();
      let day_idx = idx - ((day_in_mo_start[i_mo - start_mo] - start_day + 7)%7);

      let td = H.td();
      td.style.width = (100/n_mo).toString() + "%";
      td.id = "ui_" + fmt_date(cur_year, cur_mo+1, day_idx+1);

      // if our day falls within bounds, we decorate the td with the appropriate
      // values
      //
      if ((day_idx >= 0) &&
          (day_idx < nday_in_mo)) {

        let dt = new Date(cur_year, cur_mo, day_idx+1);

        let wd_code = NEATOCAL_PARAM.weekday_code[ dt.getDay() ];

        // If it's a weekend (Su,Sa), add the 'weekend' class to allow for highlighting
        //
        //if ((dt.getDay() == 0) ||
        //    (dt.getDay() == 6)) {
        if (NEATOCAL_PARAM.weekend_days.includes(dt.getDay())) {
          td.classList.add("weekend");
        }


        // date - day in month
        // day  - name of weekday (e.g. Su,M,T,W,R,F,Sa)
        //
        let span_date = H.span((day_idx+1).toString(), "date");
        let span_day = H.span(wd_code, "day");

        // If any param specified stylings apply, apply them.
        // Date stylings happen before weekend_date so that
        // the weekend_date, if specified, can override
        //

        date_styles(span_date);

        if ((dt.getDay() == 0) ||
            (dt.getDay() == 6)) {
          weekend_styles(span_day);
          weekend_date_styles(span_date);
        }

        else {
          weekday_styles(span_day);
        }

        td.appendChild( span_date );
        td.appendChild( span_day );

        if ((dt.getDay() == 1) && NEATOCAL_PARAM.show_week_numbers) {
          let span_week_no = H.span(getISOWeekNumber(dt), "date");
          span_week_no.style.float = "right";
          span_week_no.style.color = "rgb(230,37,7)";
          week_styles(span_week_no);
          td.appendChild(span_week_no);
        }

        let yyyy_mm_dd = fmt_date(cur_year, cur_mo+1, day_idx+1);
        if (yyyy_mm_dd in NEATOCAL_PARAM.data) {
          let txt = H.div();
          txt.innerHTML = NEATOCAL_PARAM.data[yyyy_mm_dd];
          txt.style.textAlign = "center";
          txt.style.fontWeight = "300";
          td.appendChild(txt);
        }

        // Add moon phase if enabled
        //
        renderMoonPhase(td, cur_year, cur_mo, day_idx+1);

      }
      tr.appendChild(td);

    }

    tbody.appendChild(tr);
  }

}

function neatocal_post_process() {
  let highlight_color = NEATOCAL_PARAM.highlight_color;
  let x = document.getElementsByClassName("weekend");
  for (let i = 0; i < x.length; i++) {
    x[i].style.background = highlight_color;
  }

  // Highlight today's date
  if (NEATOCAL_PARAM.today_highlight_color) {
    let today = new Date();
    let today_str = fmt_date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    let today_ele = document.getElementById("ui_" + today_str);
    if (today_ele) {
      today_ele.style.background = NEATOCAL_PARAM.today_highlight_color;
    }
  }

  if ("color_cell" in NEATOCAL_PARAM) {
    let color_cell = NEATOCAL_PARAM.color_cell;

    for (let i=0; i < color_cell.length; i++) {
      let ele = document.getElementById("ui_" + color_cell[i].date);
      if ((typeof ele === "undefined") || (ele == null)) { continue; }
      ele.style.background = color_cell[i].color;
    }
  }
}

function loadXHR(url, _cb, _errcb) {
  let xhr = new XMLHttpRequest();

  if (typeof _errcb !== "undefined") {
    xhr.addEventListener("error", _errcb);
  }

  xhr.addEventListener("loadend", _cb);
  xhr.open("GET", url);
  xhr.send();
  return xhr;
}

function neatocal_parse_data_error(raw) {
  console.log("error:", raw);
}

function neatocal_override_param(param, data) {

  let admissible_param = [
    "help",

    "year",
    "layout",

    "start_day",
    "start_month",
    "n_month",

    "weekday_code",
    "weekday_format",
    "month_code",
    "month_format",

    "weekend_days",

    "language",

    "show_moon_phase",
    "moon_phase_style",
    "moon_phase_position",
    "moon_phase_display",

    "cell_height",
    "highlight_color",
    "today_highlight_color",

    "year_font_size",
    "year_font_weight",
    "year_foreground_color",
    "year_background_color",

    "month_font_size",
    "month_font_weight",
    "month_foreground_color",
    "month_background_color",

    "weekday_font_size",
    "weekday_font_weight",
    "weekday_foreground_color",
    "weekday_background_color",

    "weekend_font_size",
    "weekend_font_weight",
    "weekend_foreground_color",
    "weekend_background_color",

    "week_font_size",
    "week_font_weight",
    "week_foreground_color",
    "week_background_color",

    "date_font_size",
    "date_font_weight",
    "date_foreground_color",
    "date_background_color",

    "weekend_date_font_size",
    "weekend_date_font_weight",
    "weekend_date_foreground_color",
    "weekend_date_background_color"

  ];

  for (let idx = 0; idx < admissible_param.length; idx++) {
    let key = admissible_param[idx];

    if (key in data) {
      param[key] = data[key];
    }
  }

  if ("color_cell" in data) {
    param.color_cell = data.color_cell;
  }

  return param;
}

function neatocal_parse_data(raw) {

  if (raw.type == "loadend") {

    if ((raw.target.readyState == 4) &&
        (raw.target.status == 200)) {

      try {
        let json_data = JSON.parse(raw.target.response);
        NEATOCAL_PARAM.data = json_data;

        if (typeof NEATOCAL_PARAM.data.param !== "undefined") {
          neatocal_override_param(NEATOCAL_PARAM, NEATOCAL_PARAM.data.param);
        }
      }
      catch (e) {
        console.log("error parsing data file:", e);
      }

      neatocal_render();

    }

    // default to render
    //
    if ((raw.target.readyState == 4) &&
        (raw.target.status == 404)) {
      neatocal_render();
    }

  }

}

function neatocal_init() {
  let sp = new URLSearchParams(`?${window.location.hash.slice(1)}&${window.location.search.slice(1)}`);

  // peel off parameters from URL
  //

  let help_param = sp.get("help");
  let year_param = sp.get("year");
  let layout_param = sp.get("layout");
  let start_month_param = sp.get("start_month");
  let n_month_param = sp.get("n_month");
  let start_day_param = sp.get("start_day");
  let highlight_color_param = sp.get("highlight_color");
  let today_highlight_color_param = sp.get("today_highlight_color");
  let cell_height_param = sp.get("cell_height");
  let weekday_code_param = sp.get("weekday_code");
  let weekday_format_param = sp.get("weekday_format");
  let month_code_param = sp.get("month_code");
  let month_format_param = sp.get("month_format");
  let language_param = sp.get("language");
  let show_week_numbers_param = sp.get("show_week_numbers");

  let weekend_days_param = sp.get("weekend_days");

  // Moon phase parameters
  //
  let show_moon_phase_param = sp.get("show_moon_phase");
  let moon_phase_style_param = sp.get("moon_phase_style");
  let moon_phase_position_param = sp.get("moon_phase_position");
  let moon_phase_display_param = sp.get("moon_phase_display");

  // fiddly stylings
  //
  let _ele_pfx = [ "year", "month", "weekday", "weekend", "week", "date", "weekend_date" ];
  let _ele_sfx = [ "font_size", "font_weight", "foreground_color", "background_color" ];
  for (let i_p=0; i_p<_ele_pfx.length; i_p++) {
    for (let i_s=0; i_s<_ele_sfx.length; i_s++) {
      let _ele_name = _ele_pfx[i_p] + "_" + _ele_sfx[i_s];
      let _ele_param = sp.get(_ele_name);

      if ((_ele_param != null) &&
          (typeof _ele_param !== "undefined")) {
        NEATOCAL_PARAM[_ele_name] = _ele_param;
      }

    }
  }

  // JSON data file
  //
  let datafn_param = sp.get("data");

  //---

  let data_fn = "";
  if ((datafn_param != null) &&
      (typeof datafn_param !== "undefined")) {
    data_fn = datafn_param;
  }
  NEATOCAL_PARAM.data_fn = data_fn;

  //---

  if ((help_param != null) &&
      (typeof help_param !== "undefined")) {
    let ui_info = document.getElementById("ui_info");
    ui_info.style.display = '';
  }

  //---

  let year = new Date().getFullYear();
  if ((year_param != null) &&
      (typeof year_param !== "undefined")) {
    year = year_param;
  }
  NEATOCAL_PARAM.year = year;

  //---

  let layout = NEATOCAL_PARAM.layout;
  if ((layout_param != null) &&
      (typeof layout_param !== "undefined")) {
    _l = sp.get("layout");
    if      (_l == "default")           { layout = "default"; }
    else if (_l == "aligned-weekdays")  { layout = "aligned-weekdays"; }
    else if (_l == "hallon-almanackan") {
      layout = "hallon-almanackan";
      NEATOCAL_PARAM.show_week_numbers = true;
      NEATOCAL_PARAM.weekend_days = [0];
    }
  }
  NEATOCAL_PARAM.layout = layout;

  //---

  let start_month = NEATOCAL_PARAM.start_month;
  if ((start_month_param != null) &&
      (typeof start_month_param !== "undefined")) {
    start_month = parseInt(start_month_param);
    if (isNaN(start_month)) {
      start_month = 0;
    }
  }
  NEATOCAL_PARAM.start_month = start_month;

  //---

  let n_month = NEATOCAL_PARAM.n_month;
  if ((n_month_param != null) &&
      (typeof n_month_param !== "undefined")) {
    n_month = parseInt(n_month_param);
    if (isNaN(n_month)) {
      n_month = 0;
    }
  }
  NEATOCAL_PARAM.n_month = n_month;

  //---

  let start_day = NEATOCAL_PARAM.start_day;
  if ((start_day_param != null) &&
      (typeof start_day_param !== "undefined")) {
    start_day = parseInt(start_day_param);
    if (isNaN(start_day)) {
      start_day = 0;
    }
  }
  NEATOCAL_PARAM.start_day = start_day;

  //---

  let highlight_color = NEATOCAL_PARAM.highlight_color;
  if ((highlight_color_param != null) &&
      (typeof highlight_color_param !== "undefined")) {
    highlight_color = highlight_color_param;
    if (highlight_color.match( /^[\da-fA-F]+/ )) {
      highlight_color = "#" + highlight_color;
    }
  }
  NEATOCAL_PARAM.highlight_color = highlight_color;

  //---

  let today_highlight_color = NEATOCAL_PARAM.today_highlight_color;
  if ((today_highlight_color_param != null) &&
      (typeof today_highlight_color_param !== "undefined")) {
    today_highlight_color = today_highlight_color_param;
    if (today_highlight_color.match( /^[\da-fA-F]+/ )) {
      today_highlight_color = "#" + today_highlight_color;
    }
  }
  NEATOCAL_PARAM.today_highlight_color = today_highlight_color;

  //---

  let cell_height = NEATOCAL_PARAM.cell_height;
  if ((cell_height_param != null) &&
      (typeof cell_height_param !== "undefined")) {
    cell_height = cell_height_param;
  }
  NEATOCAL_PARAM.cell_height = cell_height;

  //---

  if (new Set(["long", "short", "narrow"]).has(weekday_format_param)) {
    NEATOCAL_PARAM.weekday_format = weekday_format_param;
  }

  //---

  if (new Set(["numeric", "2-digit", "long", "short", "narrow"]).has(month_format_param)) {
    NEATOCAL_PARAM.month_format = month_format_param;
  }

  //---

  // language fills out the month/day codes and happens
  // before so it can be overriden by month day code
  // specification.
  //
  if ((language_param != null) &&
      (typeof language_param !== "undefined")) {

    for (let day_idx=0; day_idx<7; day_idx++) {
      NEATOCAL_PARAM.weekday_code[day_idx] = localized_day(language_param, day_idx);
    }

    for (let mo_idx=0; mo_idx<12; mo_idx++) {
      NEATOCAL_PARAM.month_code[mo_idx] = localized_month(language_param, mo_idx);
    }
  }

  //---

  let weekday_code = NEATOCAL_PARAM.weekday_code;
  if ((weekday_code_param != null) &&
      (typeof weekday_code_param !== "undefined")) {

    weekday_code = weekday_code_param.split(",");

    // padd out with blank
    //
    for (let i=weekday_code.length; i<7; i++) {
      weekday_code.push("");
    }

  }
  NEATOCAL_PARAM.weekday_code = weekday_code;

  //---

  let month_code = NEATOCAL_PARAM.month_code;
  if ((month_code_param != null) &&
      (typeof month_code_param !== "undefined")) {

    month_code = month_code_param.split(",");

    // padd out with blank
    //
    for (let i=month_code.length; i<7; i++) {
      month_code.push("");
    }

  }
  NEATOCAL_PARAM.month_code = month_code;

  //---

  // thanks to https://github.com/fawaz-alesayi/neatocal
  //
  if ((weekend_days_param != null) &&
      (typeof weekend_days_param !== "undefined")) {
    let days = weekend_days_param.split(",").map(d => parseInt(d.trim()));
    NEATOCAL_PARAM.weekend_days = days.filter(d => !isNaN(d) && d >= 0 && d <= 6);
  }

  // hallon-almanackan defaults to showing week numbers.
  // If the showing week numbers is specified, use user specified value,
  // whether true or false, otherwise, leave it alone.
  //
  if ((show_week_numbers_param != null) &&
      (typeof show_week_numbers_param !== "undefined")) {
    NEATOCAL_PARAM.show_week_numbers = (show_week_numbers_param === "true");
  }

  //---

  // Moon phase parameters
  //
  let show_moon_phase = NEATOCAL_PARAM.show_moon_phase;
  if ((show_moon_phase_param != null) &&
      (typeof show_moon_phase_param !== "undefined")) {
    show_moon_phase = (show_moon_phase_param === "true" || show_moon_phase_param === "1");
  }
  NEATOCAL_PARAM.show_moon_phase = show_moon_phase;

  //---

  let moon_phase_style = NEATOCAL_PARAM.moon_phase_style;
  if ((moon_phase_style_param != null) &&
      (typeof moon_phase_style_param !== "undefined")) {
    if (moon_phase_style_param === "css" ||
        moon_phase_style_param === "symbol" ||
        moon_phase_style_param === "name") {
      moon_phase_style = moon_phase_style_param;
    }
  }
  NEATOCAL_PARAM.moon_phase_style = moon_phase_style;

  //---

  let moon_phase_position = NEATOCAL_PARAM.moon_phase_position;
  if ((moon_phase_position_param != null) &&
      (typeof moon_phase_position_param !== "undefined")) {
    if (moon_phase_position_param === "below" ||
        moon_phase_position_param === "inline") {
      moon_phase_position = moon_phase_position_param;
    }
  }
  NEATOCAL_PARAM.moon_phase_position = moon_phase_position;

  //---

  let moon_phase_display = NEATOCAL_PARAM.moon_phase_display;
  if ((moon_phase_display_param != null) &&
      (typeof moon_phase_display_param !== "undefined")) {
    if (moon_phase_display_param === "all" ||
        moon_phase_display_param === "changes") {
      moon_phase_display = moon_phase_display_param;
    }
  }
  NEATOCAL_PARAM.moon_phase_display = moon_phase_display;

  //---

  // if we have a data file, short circuit to wait till load.
  // neatocal_parse_data will call neatocal_render to render the
  // calendar.
  //
  if (NEATOCAL_PARAM.data_fn) {
    loadXHR( NEATOCAL_PARAM.data_fn, neatocal_parse_data, neatocal_parse_data_error );
    return;
  }

  // no data file, just render
  //
  neatocal_render();
}

function neatocal_render() {

  let cur_start_month = NEATOCAL_PARAM.start_month;
  let month_remain = NEATOCAL_PARAM.n_month;
  let s_year = parseInt(NEATOCAL_PARAM.year);
  let e_year = parseInt(NEATOCAL_PARAM.year) + Math.floor((cur_start_month + month_remain-1)/12)

  let layout = NEATOCAL_PARAM.layout;

  let year_fraction_tot = 0;
  let year_fraction = [];
  for ( let y = s_year; y <= e_year; y++ ) {
    let del_mo = (((cur_start_month + month_remain) > 12) ? (12-cur_start_month) : (month_remain));
    year_fraction.push( del_mo );
    cur_start_month = 0;
    month_remain -= del_mo;

    year_fraction_tot += del_mo;
  }

  for (let i=0; i < year_fraction.length; i++) {
    year_fraction[i] /= year_fraction_tot;
  }

  // if we only have one year, put it in the center
  // otherwise find the proportion of other years
  //   and adjust the year header appropriately

  let ui_year = document.getElementById("ui_year");
  ui_year.innerHTML = "";

  for ( let y = s_year, idx = 0; y <= e_year; y++, idx++) {
    let span = H.span();
    span.innerHTML = y.toString();
    span.style["display"] = "inline-block";
    span.style["width"] = (100*year_fraction[idx]).toString() + "%";
    span.style["justify-content"] = "center";
    span.style["text-align"] = "center";
    span.style["margin"] = "0 0 .5em 0";

    year_styles(span);

    ui_year.appendChild( span );
  }

  //---

  if (layout == "aligned-weekdays") {
    neatocal_aligned_weekdays();
  }
  else if (layout == "hallon-almanackan") {
    neatocal_hallon_almanackan();
  }
  else {
    neatocal_default();
  }

  neatocal_post_process();
}
