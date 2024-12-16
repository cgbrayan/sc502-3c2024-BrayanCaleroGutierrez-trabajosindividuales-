document.addEventListener("DOMContentLoaded", function () {
  let isEditMode = false;
  let isEditModeComment = false;
  let edittingId;
  let edittingIdComment;
  let tasks = [];
  const API_URL = "backend/tasks.php";

  async function loadTasks() {
    //va al servidor por las tareas
    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        tasks = await response.json();
        renderTasks(tasks);
      } else {
        if (response.status == 401) {
          window.location.href = "index.html";
        }
        console.error("Error al obtener tareas");
      }
    } catch (err) {
      console.error(err);
    }
  }

  function renderTasks(tasks) {
    //traer las tareas desde el backend
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";
    tasks.forEach(function (task) {
      let commentsList = "";
      if (task.comentarios && task.comentarios.length > 0) {
        commentsList = '<ul class="list-group list-group-flush">';

        task.comentarios.forEach((comment) => {
          commentsList += `
          <li class="list-group-item w-100"><p>${comment.comment} </p>
          <div class="d-flex justify-content-start gap-2">
                    <button type="button" class="btn btn-sm btn-link remove-comment" data-visitid="${task.tarea.id}" data-commentid="${comment.id}">Remove</button>
                    <button type="button" class="btn btn-sm btn-link edit-comment"  data-id="${task.tarea.id}" data-commentid="${comment.id}">Update</button></div>
                    </li>`;
        });
        commentsList += "</ul>";
      }
      const taskCard = document.createElement("div");
      taskCard.className = "col-md-4 mb-3";
      taskCard.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${task.tarea.title}</h5>
                    <p class="card-text">${task.tarea.description}</p>
                    <p class="card-text"><small class="text-muted">Due: ${task.tarea.due_date}</small> </p>
                    ${commentsList}
                     <button type="button" class="btn btn-sm btn-link add-comment"  data-id="${task.tarea.id}">Add Comment</button>
                </div>
                <div class="card-footer d-flex justify-content-between">
                    <button class="btn btn-secondary btn-sm edit-task"data-id="${task.tarea.id}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-task" data-id="${task.tarea.id}">Delete</button>
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

    document.querySelectorAll(".add-comment").forEach(function (button) {
      button.addEventListener("click", function (e) {
        // alert(e.target.dataset.id);
        document.getElementById("comment-task-id").value = e.target.dataset.id;
        const modal = new bootstrap.Modal(
          document.getElementById("commentModal")
        );
        modal.show();
      });
    });
    document.querySelectorAll(".remove-comment").forEach(function (button) {
      button.addEventListener("click", handleDeleteComment);
    });

    document.querySelectorAll(".edit-comment").forEach(function (button) {
      button.addEventListener("click", handleEditComment);
    });
  }

  function handleEditTask(event) {
    try {
      // alert(event.target.dataset.id);
      //localizar la tarea quieren editar
      const taskId = parseInt(event.target.dataset.id);
      const task = tasks.find((t) => t.tarea.id === taskId);
      //cargar los datos en el formulario
      document.getElementById("task-title").value = task.tarea.title;
      document.getElementById("task-desc").value = task.tarea.description;
      document.getElementById("due-date").value = task.tarea.due_date;
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

  function handleEditComment(event) {
    try {
      const taskId = parseInt(event.target.dataset.id);
      const commentId = parseInt(event.target.dataset.commentid);
      const task = tasks.find((t) => t.tarea.id === taskId);
      const comment = task.comentarios.find((c) => c.id === commentId);
      document.getElementById("task-comment").value = comment.comment;
      isEditModeComment = true;
      edittingId = taskId;
      edittingIdComment = commentId;

      const modal = new bootstrap.Modal(
        document.getElementById("commentModal")
      );
      modal.show();
    } catch (error) {
      alert("Error trying to edit a comment");
      console.error(error);
    }
  }

  async function handleDeleteTask(event) {
    const id = parseInt(event.target.dataset.id);
    const response = await fetch(`${API_URL}?id=${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      loadTasks();
    } else {
      console.error("Error eliminando las tareas");
    }
  }

  async function handleDeleteComment(event) {
    const commentId = parseInt(event.target.dataset.commentid);
    const response = await fetch(
      `backend/tasks.php?data=comment&id=${commentId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (response.ok) {
      loadTasks();
    } else {
      console.error("Error eliminando las tareas");
    }
  }



  document
    .getElementById("comment-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const comment = document.getElementById("task-comment").value;

      const selectedTask = document.getElementById("comment-task-id").value;

      if (isEditModeComment) {
        const response = await fetch(
          `${API_URL}?data=comment&id=${edittingIdComment}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              comment: comment,
              id: edittingIdComment,
            }),
            credentials: "include",
          }
        );
        if (!response.ok) {
          console.error("Sucedio un error");
          return;
        }
        isEditModeComment = false;
        edittingIdComment = null;

        const modalComment = bootstrap.Modal.getInstance(
          document.getElementById("commentModal")
        );
        modalComment.hide();
        loadTasks();
        return;
      }
      const newComment = {
        task_id: selectedTask,
        comment: comment,
      };
      console.log(newComment);

      const response = await fetch(`${API_URL}?data=comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newComment),
        credentials: "include",
      });
      if (!response.ok) {
        console.error("Sucedio un error");
      }
      const modalComment = bootstrap.Modal.getInstance(
        document.getElementById("commentModal")
      );
      modalComment.hide();
      loadTasks();
    });

  document
    .getElementById("task-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("task-title").value;
      const description = document.getElementById("task-desc").value;
      const dueDate = document.getElementById("due-date").value;

      if (isEditMode) {
        //editar
        const response = await fetch(`${API_URL}?id=${edittingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title,
            description: description,
            due_date: dueDate,
          }),
          credentials: "include",
        });
        if (!response.ok) {
          console.error("Sucedio un error");
        }
      } else {
        const newTask = {
          title: title,
          description: description,
          due_date: dueDate,
        };
        //enviar la tarea al backend
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
          credentials: "include",
        });
        if (!response.ok) {
          console.error("Sucedio un error");
        }
      }
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("taskModal")
      );
      modal.hide();
      loadTasks();
    });

  document
    .getElementById("commentModal")
    .addEventListener("show.bs.modal", function () {
      document.getElementById("comment-form").reset();
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
