const url =
  "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

d3.json(url, function (data) {
  console.log(data.monthlyVariance);

  let xPaddingLeft = 90;
  let xPaddingRight = 30;
  let rectWidth = 4;
  let rectHeight = 31; // Smaller than 33 used for height bc we use yTop to give room for top of graph in yScale range
  let yTop = 40;
  let width = 120 + (rectWidth * data.monthlyVariance.length) / 12; // 3px fpr width for each month. We take the amount of data given and divide it by 12 months in year
  let height = 33 * 12; // 33 px for each bar and 12 months

  // Must call on monthlyVariance after data. Set an array of all of the years being used in data's array.
  let year = data.monthlyVariance.map((element) => element.year);
  let minYear = d3.min(year);
  let maxYear = d3.max(year);

  // Set up a scale to return a color in rgb() format. This way it is easier to assign color dynamically instead of hard coding if/else statements for fill in rectangles
  let rgbScale = d3
    .scaleLinear()
    .domain([0, 30, 50, 70, 100])
    .range(["blue", "lightblue", "whitesmoke", "orange", "red"]); // Please don't forget array's brackets next time...
  // We use this function to return a rgb() color based off the percent that is given by placing it in the rgbScale
  function createColor(percent) {
    return rgbScale(percent);
  } // Example createColor(50) // Outputs rgb(255, 255, 255)
  // Example createColor(80) // Outputs rgb(255, 110, 0)

  // Set up varianceToPercent scale to change the variance of each object to a percent so we can convert it to our colorScale later when we fill the rectangles
  let variance = data.monthlyVariance.map((element) => element.variance);
  let minVariance = d3.min(variance);
  let maxVariance = d3.max(variance);
  let varianceToPercent = d3
    .scaleLinear()
    .domain([minVariance, maxVariance])
    .range([0, 100]);

  // Created this object so in tooltip we can change the month number into the month's name as a string
  let monthNumberToNameObject = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };

  // set up svgContainer in json function because we need it to set height and width with the data information.
  svgContainer = d3
    .select("#heat-map")
    .append("svg")
    .attr("width", width)
    .attr("height", height + 80) // Add the 80 so the container goes down farther than graph thus the x-axis is able to be seen.
    .attr("class", "graph");

  // Set tooltip
  tooltip = d3
    .select("#heat-map")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", "0");

  // Set xScale
  const xScale = d3
    .scaleLinear()
    .domain([minYear, maxYear]) // Set domain as the amount of years in the data's array
    .range([xPaddingLeft, width - xPaddingRight]); // Range is set to give padding to both left and right side of the svg graph. Left padding is bigger to give room for y-axis.
  let xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.format("d")); // Gets rid of commas for each year.

  // Call on xAxis and append it.
  svgContainer
    .append("g")
    .attr("transform", "translate(0," + height + ")") // Places the xAxis at bottom of svg.
    .call(xAxis)
    .attr("id", "x-axis");

  // Text for x-axis
  svgContainer
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle") // Centers the text horizontally. The anchor is what is placed on x attribute. Instead of putting the left part of text at X. It puts the middle part of text at x
    .attr("id", "x-axis-text")
    .text("Years");

  const yScale = d3
    .scaleLinear() // spreads out the 12 months evenly.
    .domain([-0.5, 11]) // Set date for January and December. Add the .5 So the Decemeber tick is not on the x-axis but is raised so ticks are in center of each rect.
    .range([height, yTop]); // Give 20 pixels from top of svg to top of y axis.

  let yAxis = d3
    .axisLeft()
    .scale(yScale)
    // Without tickFormat we just display numbers 0-11 as tick values for y-axis.
    .tickFormat((element) => {
      // Change numbers to string of name of month.
      switch (element) {
        case 0:
          return "January";
          break;
        case 1:
          return "February";
          break;
        case 2:
          return "March";
          break;
        case 3:
          return "April";
          break;
        case 4:
          return "May";
          break;
        case 5:
          return "June";
          break;
        case 6:
          return "July";
          break;
        case 7:
          return "August";
          break;
        case 8:
          return "September";
          break;
        case 9:
          return "October";
          break;
        case 10:
          return "November";
          break;
        case 11:
          return "December";
          break;
        default:
          // Should always add default with switch loops.
          return "";
          break;
      }
    });

  // Call yAxis and append it.
  svgContainer
    .append("g")
    .attr("transform", "translate(" + xPaddingLeft + ", 0)")
    .call(yAxis)
    .attr("id", "y-axis");

  // Text for y-axis
  svgContainer
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle") // Centers the text horizontally. The anchor is what is placed on x attribute. Instead of putting the left part of text at X. It puts the middle part of text at x
    .attr("id", "y-axis-text")
    .text("Months");

  // Call each rectangle
  svgContainer
    .selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("width", rectWidth) // Each bar will be 3px wide as we used this earlier when setting width for container
    .attr("height", rectHeight) // 33 because we use this to help set up height of svg by multiplying 33 * 12
    .attr("x", (d, i) => xScale(d.year + 0.3)) // Sets x placement based off year.  // Add the -1.5 to shift all right one pixel so y-axis is visible.
    .attr("y", (d, i) => yScale(d.month - 0.5)) // Take month - .5 to equal index of correct month we want. then - the .5 as well because we want to move it up thus the first y-axis number is not on the x-axis
    // Withou the .5 it would move the bars down halfway to where it covers the x-axis.
    .attr("data-month", (d) => d.month - 1) // Must have -1 in order to past the test as they want index
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => data.baseTemperature + d.variance)
    .style("fill", function (d) {
      /* if statements are not needed because we are taking the variance value (e.g. .917) and convert it into a percent using the varianceToPercent scale.
       Then we take the percent from varianceToPercent scale and put it inside the createColor function which returns that percent into a rbg() color from the rgbScale that we created at 
       the beginning of the code. */
      return createColor(varianceToPercent(d.variance));
    })
    .on("mouseover", function (d) {
      tooltip.style("opacity", "0.8");
      tooltip
        .style("left", d3.event.pageX + 15 + "px")
        .style("top", d3.event.pageY - 75 + "px")
        .html(
          d.year +
            "-" +
            monthNumberToNameObject[d.month] +
            "<br>" +
            // Displays temperature after being rounded to two decimal places at most.
            Math.round((data.baseTemperature + d.variance) * 100) / 100 +
            "&#8451" +
            "<br>" +
            // Ternary operator to give a + to numbers greater than zero. Also rounded the variance to two decimal places. (- is already given to negative numbers)
            (d.variance > 0
              ? "+" + Math.round(d.variance * 100) / 100
              : Math.round(d.variance * 100) / 100 + "&#8451")
        )
        .attr("data-year", d.year);
    })
    .on("mouseout", function (d) {
      tooltip.style("opacity", "0").style("top", -30000 + "px");
      // Add this top line to move tooltip off svg when mouseout so the tooltip is not covering another datapoint. Thus being able to use mouseover for points that would otherwise be behind the tooltip (needs to be negative)
    });

  // Start making legend here
  /* We want to make legend more than just a few colors in an array as we made the color scheme dynamic by using scales like rgbScale. So we are creating 100 small rect(one for each percent) to display the colors
   Thus we shall make an array that goes from 1-100 */
  let legendArray = [];
  for (let i = 1; i <= 100; i++) {
    legendArray.push(i);
  }

  let legendBarWidth = 2.5;
  let legendWidth = legendBarWidth * 100; // Need this to set range for scale. (100 rect for each percent * barWidth is the total width of legend)

  // To pass the tests in challenge we need to set legend up first and then append it with "g" and "rect". My first way works the exact same in comment section below
  let legend = svgContainer
    .append("g")
    .attr("id", "legend")
    .attr("transform", "translate(" + width / 7 + ",0)");

  legend
    .append("g")
    .selectAll("rect")
    .data(legendArray) // Now legendArray is full with 100 elements numbered for each percent
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * legendBarWidth)
    .attr("y", height + 40)
    .attr("width", legendBarWidth)
    .attr("height", 20)
    .style("fill", (d, i) => createColor(i));

  legendScale = d3
    .scaleLinear()
    .domain([minVariance, maxVariance]) // The scale only shows what variance is compared to color.
    .range([0, legendWidth]); // Range is how long the legend is

  legendAxis = d3.axisBottom().scale(legendScale).ticks(7); // Add ticks(7) to take some ticks away from default amount given
  svgContainer
    .append("g")
    .attr("transform", "translate(" + width / 7 + ", " + (height + 60) + ")") // Places the legendAxis below legend
    .call(legendAxis)
    .attr("id", "legend-axis");
});

/* This is my orginal legend section that works perfectly but would not past tests as we need to append rectangles to the legend for the tests and not just straight on to the svgContainer.

  // Start making legend here
  /* We want to make legend more than just a few colors in an array as we made the color scheme dynamic by using scales like rgbScale. So we are creating 100 small rect(one for each percent) to display the colors
   Thus we shall make an array that goes from 1-100 /
   let legendArray = [];
   for (let i = 1; i <= 100; i++) {
     legendArray.push(i);
   }
 
   let legendBarWidth = 2.5;
   let legendWidth = legendBarWidth * 100; // Need this to set range for scale. (100 rect for each percent * barWidth is the total width of legend)
 
   svgContainer
     .selectAll("#legend")
     .data(legendArray) // Now legendArray is full with 100 elements numbered for each percent
     .enter()
     .append("rect")
     .attr("id", "legend")
     .attr("x", (d, i) => i * legendBarWidth)
     .attr("y", height + 40)
     .attr("width", legendBarWidth)
     .attr("height", 20)
     .style("fill", (d, i) => createColor(i))
     .attr("transform", "translate(" + width / 7 + ",0)");
 
   legendScale = d3
     .scaleLinear()
     .domain([minVariance, maxVariance]) // The scale only shows what variance is compared to color.
     .range([0, legendWidth]); // Range is how long the legend is
 
   legendAxis = d3.axisBottom().scale(legendScale).ticks(7); // Add ticks(7) to take some ticks away from default amount given
   svgContainer
     .append("g")
     .attr("transform", "translate(" + width / 7 + ", " + (height + 60) + ")") // Places the legendAxis below legend
     .call(legendAxis)
     .attr("id", "legend-axis");
 */
