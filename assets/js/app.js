const cl = console.log;

const stdForm = document.getElementById("stdForm");
const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const email = document.getElementById("email");
const contact = document.getElementById("contact");
const addStd = document.getElementById("addStd");
const updateStd = document.getElementById("updateStd");
const spinner = document.getElementById("spinner");
const stdContainer = document.getElementById("stdContainer");

const base_url = `https://bhagyashri-s-first-database-default-rtdb.firebaseio.com`;
const std_url = `${base_url}/students.json`;

//localstate
let localstate = {
  stdArr: [],
  updateid: null,
};

//snackbar

function snackbar(msg, icon) {
  Swal.fire({
    title: msg,
    icon: icon,
    timer: 3000,
  });
}

//handleSpinner
function handleSpinner() {
  spinner.classList.toggle("d-none");
}

//nestedbojtoArr

function nestedbojtoArr(obj) {
  for (const key in obj) {
    obj[key].id = key;
    localstate.stdArr.unshift(obj[key]);
  }
}

//generic function

function makeApiCall(url, methodName, body) {
  body = body ? JSON.stringify(body) : null;
  return fetch(url, {
    method: methodName,
    body: body,
    headers: {
      "content-type": "application/json",
      autho: "JWT token",
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error(`http : ${res.status}`);
    }
    return res.json();
  });
}

//rendering

function rendering(arr) {
  let res = "";

  arr.forEach((std, i) => {
    res += `<tr id="${std.id}">
                                    <td>${i + 1}</td>
                                    <td>${std.fname}</td>
                                    <td>${std.lname}</td>
                                    <td>${std.email}</td>
                                    <td>${std.contact}</td>
                                    <td class="d-flex justify-content-between">
                                        <button onclick="onEdit(this)" type="button" class="btn btn-success btn-sm mr-2">Edit</button>
                                        <button onclick="onRemove(this)" type="button" class="btn btn-danger btn-sm">Remove</button>
                                    </td>
                                </tr>`;
  });
  stdContainer.innerHTML = res;
}

//fetchstdlist

function fetchstdlist() {
  handleSpinner();
  makeApiCall(std_url, "GET")
    .then((data) => {
      nestedbojtoArr(data);
      rendering(localstate.stdArr);
    })
    .catch((err) => {
      cl(err);
      snackbar(err, "error");
    })
    .finally(() => {
      handleSpinner();
    });
}

fetchstdlist();

//create

function onSubmit(eve) {
  eve.preventDefault();

  let newStd = {
    fname: fname.value,
    lname: lname.value,
    email: email.value,
    contact: contact.value,
  };

  stdForm.reset();
  handleSpinner();
  makeApiCall(std_url, "POST", newStd)
    .then((data) => {
      newStd.id = data.name;
      localstate.stdArr.unshift(newStd);

      let tr = document.createElement("tr");
      tr.id = data.name;
      tr.innerHTML = `<td>${localstate.stdArr}</td>
                                    <td>${newStd.fname}</td>
                                    <td>${newStd.lname}</td>
                                    <td>${newStd.email}</td>
                                    <td>${newStd.contact}</td>
                                    <td class="d-flex justify-content-between align-items-center">
                                        <button onclick="onEdit(this)" type="button" class="btn btn-success btn-sm mr-2">Edit</button>
                                        <button onclick="onRemove(this)" type="button" class="btn btn-danger btn-sm">Remove</button>
                                    </td>`;
      stdContainer.prepend(tr);
      let srno = document.querySelectorAll("#stdContainer tr td:first-child");
      srno.forEach((e, i) => (e.innerHTML = i + 1));
      snackbar(
        `student witn name ${newStd.fname} ${newStd.lname} created successfully`,
        "success",
      );
    })
    .catch((err) => {
      cl(err);
      snackbar(err, "error");
    })
    .finally(() => {
      handleSpinner();
    });
}

//delete

function onRemove(ele) {
  let removeId = ele.closest("tr").id;
  // cl(removeId)

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, remove it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let remove_url = `${base_url}/students/${removeId}.json`;
      handleSpinner();
      makeApiCall(remove_url, "DELETE")
        .then((data) => {
          let idx = localstate.stdArr.findIndex((e) => e.id === removeId);
          localstate.stdArr.splice(idx, 1);

          ele.closest("tr").remove();

          let updsrno = document.querySelectorAll(
            "#stdContainer tr td:first-child",
          );
          updsrno.forEach((e, i) => (e.innerHTML = i + 1));

          snackbar(
            `student with id ${removeId} removed successfully`,
            "success",
          );
        })
        .catch((err) => {
          cl(err);
          snackbar(err, "error");
        })
        .finally(() => {
          handleSpinner();
        });
    }
  });
}

//edit

function onEdit(ele) {
  let editId = ele.closest("tr").id;
  // cl(editId)

  localstate.updateid = editId;

  let editObj = localstate.stdArr.find((e) => e.id === editId);

  fname.value = editObj.fname;
  lname.value = editObj.lname;
  email.value = editObj.email;
  contact.value = editObj.contact;

  addStd.classList.add("d-none");
  updateStd.classList.remove("d-none");
}

function onUpdate() {
  let updateId = localstate.updateid;
  // cl(updateId)

  let update_url = `${base_url}/students/${updateId}.json`;

  let updateObj = {
    fname: fname.value,
    lname: lname.value,
    email: email.value,
    contact: contact.value,
    id: updateId,
  };

  handleSpinner();
  stdForm.reset();

  makeApiCall(update_url, "PATCH", updateObj)
    .then((data) => {
      let idx = localstate.stdArr.findIndex((e) => e.id === updateId);
      localstate.stdArr[idx] = updateObj;

      let trs = document.getElementById(updateId).children;
      trs[1].innerText = data.fname;
      trs[2].innerText = data.lname;
      trs[3].innerText = data.email;
      trs[4].innerText = data.contact;

      snackbar(
        `student with name ${updateObj.fname} ${updateObj.lname} updated successfully`,
        "success",
      );

      addStd.classList.remove("d-none");
      updateStd.classList.add("d-none");
    })
    .catch((err) => {
      cl(err);
      snackbar(err, "error");
    })
    .finally(() => {
      handleSpinner();
    });
}
stdForm.addEventListener("submit", onSubmit);
updateStd.addEventListener("click", onUpdate);
