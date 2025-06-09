const xValues = [-90,-80,-70,-60,-50,-40,-30,-20,-10,0];


Chart.defaults.global.defaultFontFamily = "Poppins";


new Chart("gradeChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{
      label: 'Math',
      data: [90,85,93,87,95,97,99,80,86,95],
      borderColor: "rgb(238, 112, 53)",
      fill: false
    },{
      label: 'English',    
      data: [80,75,75,80,67,70,75,60,67,75],
      borderColor: "rgb(53, 226, 238)",
      fill: false
    },{
      label: 'History',    
      
      data: [33,50,65,50,67,60,50,70,60,65],
      borderColor: "rgb(53, 238, 53)",
      fill: false
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    title: {
        display: true,
        text: 'Grades Since the Past 90 Days',
    },
    legend: {
        display: true,
        position: 'bottom',
        labels: {
            boxWidth: 20,
            padding: 10,
            font: {
                size: 12
            }
        }
    },
    scales: {
        yAxes: [{
            ticks: {
                min: 0,
                max: 100,
                stepSize: 20
            }
        }],
        xAxes: [{
            ticks: {
                maxRotation: 45,
                minRotation: 45
            }
        }]
    },
    layout: {
        padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    }
  }
});

