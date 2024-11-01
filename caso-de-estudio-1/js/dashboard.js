document.addEventListener("DOMContentLoaded", function () {
  let isEditMode = false;
  let edittingId;
  const tasks = [
    {
      id: 1,
      title: "Complete project report",
      description: "Prepare and submit the project report",
      dueDate: "2024-12-01",
      comments: [],
    },
    {
      id: 2,
      title: "Team Meeting",
      description: "Get ready for the season",
      dueDate: "2024-12-01",
      comments: [],
    },
    {
      id: 3,
      title: "Code Review",
      description: "Check partners code",
      dueDate: "2024-12-01",
      comments: [],
    },
    {
      id: 4,
      title: "Deploy",
      description: "Check deploy steps",
      dueDate: "2024-12-01",
      comments: [],
    },
  ];

  function loadTasks() {
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach(function (task) {
      const taskCard = document.createElement("div");
      taskCard.className = "col-md-4 mb-3";
      taskCard.innerHTML = `
          <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">${task.title}</h5>
                        <p class="card-text">${task.description}</p>
                        <p class="card-text"><small class="text-muted">Due: ${task.dueDate}</small></p>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" id="comment-input-${task.id}" placeholder="Add a comment">
                            <button data-id="${task.id}" onclick="addComment(${task.id})"><span>&#10004;</span></button>
                        </div>
                        <button data-id="${task.id}" onclick="showComments(${task.id})">Comments</button>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-secondary btn-sm edit-task" data-id="${task.id}">Edit</button>
                        <button class="btn btn-danger btn-sm delete-task" data-id="${task.id}">Delete</button>
                    </div>
                </div>
          `;
      taskList.appendChild(taskCard);
    });

    document.querySelectorAll(".edit-task").forEach(function (button) {
      button.addEventListener("click", handleEditTask);
    });

    document.querySelectorAll(".delete-task").forEach(function (button) {
      button.addEventListener("click", handleDeleteTask);
    });

  }

  window.addComment = function (taskId) {
    const comment = document.getElementById(`comment-input-${taskId}`);
    const content = comment.value;

    if (content) {
      const task = tasks.find((t) => t.id === taskId);
      const newComment = {
        id: task.comments.length + 1,
        text: content,
      };
      task.comments.push(newComment);
      comment.value = "";
    }
  };

  window.showComments = function (taskId) {
    const task = tasks.find((t) => t.id === taskId);
    const commentsList = document.getElementById("comments-list");
    commentsList.innerHTML = "";

    task.comments.forEach((comment) => {
      const commentView = document.createElement("div");
      commentView.className =
        "d-flex justify-content-between align-items-center";
      commentView.innerHTML = `
            <span>${comment.text}</span>
            <button  onclick="deleteComment(${taskId}, ${comment.id})">Delete</button>
        `;
      commentsList.appendChild(commentView);
    });

    if (task.comments.length > 0) {
      const commentsModal = new bootstrap.Modal(
        document.getElementById("commentsModal")
      );
      commentsModal.show();
    } else {
      const commentsModal = bootstrap.Modal.getInstance(
        document.getElementById("commentsModal")
      );
      commentsModal.hide();
    }
  };

  window.deleteComment = function (taskId, commentId) {
    const task = tasks.find((t) => t.id === taskId);
    const encontrar = task.comments.findIndex((c) => c.id === commentId);
    if (encontrar > -1) {
      task.comments.splice(encontrar, 1);
      showComments(taskId);
    }
  };

  function handleEditTask(event) {
    try {
      // alert(event.target.dataset.id);
      //localizar la tarea quieren editar
      const taskId = parseInt(event.target.dataset.id);
      const task = tasks.find((t) => t.id === taskId);
      //cargar los datos en el formulario
      document.getElementById("task-title").value = task.title;
      document.getElementById("task-desc").value = task.description;
      document.getElementById("due-date").value = task.dueDate;
      //ponerlo en modo edicion
      isEditMode = true;
      edittingId = taskId;
      //mostrar el modal
      const modal = new bootstrap.Modal(document.getElementById("taskModal"));
      modal.show();
    } catch (error) {
      alert("Error trying to edit a task");
      console.error(error);
    }
  }

  function handleDeleteTask(event) {
    // alert(event.target.dataset.id);
    const id = parseInt(event.target.dataset.id);
    const index = tasks.findIndex((t) => t.id === id);
    tasks.splice(index, 1);
    loadTasks();
  }

  document.getElementById("task-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("task-title").value;
    const description = document.getElementById("task-desc").value;
    const dueDate = document.getElementById("due-date").value;

    if (isEditMode) {
      //todo editar
      const task = tasks.find((t) => t.id === edittingId);
      task.title = title;
      task.description = description;
      task.dueDate = dueDate;
    } else {
      const newTask = {
        id: tasks.length + 1,
        title: title,
        description: description,
        dueDate: dueDate,
      };
      tasks.push(newTask);
    }
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("taskModal")
    );
    modal.hide();
    loadTasks();
  });

  document
    .getElementById("taskModal")
    .addEventListener("show.bs.modal", function () {
      if (!isEditMode) {
        document.getElementById("task-form").reset();
        // document.getElementById('task-title').value = "";
        // document.getElementById('task-desc').value = "";
        // document.getElementById('due-date').value = "";
      }
    });

  document
    .getElementById("taskModal")
    .addEventListener("hidden.bs.modal", function () {
      edittingId = null;
      isEditMode = false;
    });
  loadTasks();
});
