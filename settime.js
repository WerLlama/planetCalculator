 // Set the value of dateInput to the current date and time
 const currentDate = new Date();
 const year = currentDate.getFullYear();
 const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Month starts from 0
 const day = currentDate.getDate().toString().padStart(2, '0');
 const hours = currentDate.getHours().toString().padStart(2, '0');
 const minutes = currentDate.getMinutes().toString().padStart(2, '0');
 document.getElementById('dateInput').value = `${year}-${month}-${day}T${hours}:${minutes}`;

 //run calculatePositions
 document.addEventListener("DOMContentLoaded", function() {
    // Call calculatePositions() to calculate planet positions
    calculatePositions();
 });
