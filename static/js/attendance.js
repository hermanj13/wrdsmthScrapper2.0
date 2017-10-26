let students
let studentsList = [];

$(document).ready(function() {

  var onLoad = function() {
    $.ajax({
          url: '/attendance/retrieve',
          method: "GET"
        })
        // After the data comes back from the API
        .done(function(response) {
          $(".loader").hide()
          students = response
          let present = 0;
          let absentList = "";
          let html = `<table class="table table-striped table-hover table-dark"><thead><tr><th>Name</th><th>Present?</th></tr></thead><tbody>`

          students.forEach(function(student) {
            studentsList.push(student.name.split(" ")[0])
            if(student.present === true){
              present++;
              html += `<tr><th>` + student.name + `</th><td><label class="form-switch"><input id="` + student.name.split(" ")[0] + `" class="attendance" type="checkbox" checked><i></i></label></td><td></td></tr>`
            }else{
              html += `<tr><th>` + student.name + `</th><td><label class="form-switch"><input id="` + student.name.split(" ")[0] + `" class="attendance" type="checkbox"><i></i></label></td><td></td></tr>`
              absentList += `<tr><td><h3>` + student.name.split(" ")[0] + `</h3></td></tr>`
            }
          })
          $("#absentList").html(absentList)
          $("#present").html(present);
          $("#absent").html(25 - present);
          $("#fillHere").html(html);
        })
  }();

  function absent(student) {
    let index = studentsList.indexOf(student)
    students[index].present = false
  };

  function inClass(student) {
    let index = studentsList.indexOf(student)
    students[index].present = true
  };

  $("#submit").click(function(){
    $(".loader").show()
    data = JSON.stringify(students)
    $.post( "/attendance/submit", {data: data})
    setTimeout(function(){
      location.reload();
    },750)
  })

  $(document).on("change", "input", function() {
    let present = 0;
    let absentList = "";
    $("input").each(function() {
      if (this.checked === true) {
        inClass(this.id);
        present++;
      } else {
        absent(this.id)
        absentList += `<tr><td><h3>` + this.id + `</h3></td></tr>`
      }
    })
    $("#absentList").html(absentList)
    $("#present").html(present);
    $("#absent").html(25 - present);
  });
});
