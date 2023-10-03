document.addEventListener("DOMContentLoaded", () => {
    const addTaskButton = document.getElementById("addTask");
    const addFromAPIButtton = document.getElementById("renderFromApi");
    const cardContainer = document.getElementById("main-card-container");
    const filterInputButton = document.getElementById("filterInputButton")
    const deleteLocalStorage = document.getElementById("deleteLocalStorage");
    const filterInput = document.getElementById("filterInput");
    const resetFilter = document.getElementById("resetFilter");

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function enableWhenAnyRecords() {
        let itemString = localStorage.getItem('tasks');
        if (itemString !== null) {
            try {
                let itemArray = JSON.parse(itemString);
                let elementCount = itemArray.length;
                if (elementCount > 0) {
                    resetFilter.disabled = false;
                    filterInput.disabled = false;
                    filterInputButton.disabled = false;
                    deleteLocalStorage.disabled = false;
                }
            }
            catch (error) {
                console.log("Failed to parse localStorage")
            }
        }
        else {

            resetFilter.disabled = true;
            filterInput.disabled = true;
            filterInputButton.disabled = true;
            deleteLocalStorage.disabled = true;
        }
    };

    function deleteKeyIfEmpty() {
        const itemString = localStorage.getItem('tasks');
        if (!itemString || JSON.parse(itemString).length === 0) {
            localStorage.removeItem('tasks');
        }
        enableWhenAnyRecords();
    }

    window.addEventListener('storage', function (e) {
        if (e.key === 'tasks') {
            deleteKeyIfEmpty();
            enableWhenAnyRecords();
        }
    });


    filterInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            renderTasks(tasks, filterInput.value);
        }
    });
    // Main function to render cards
    function renderTasks(array, usernameFilter) {

        cardContainer.innerHTML = "";
        array.forEach((task, index) => {

            if (usernameFilter && !task.name.toLowerCase().includes(usernameFilter.toLowerCase())) {
                return;
            }
            const cardDiv = document.createElement('div');
            cardDiv.className = 'card text-black bg-primary  mb-3';
            cardDiv.style.maxWidth = '18rem';

            const cardHeaderDiv = document.createElement('div');
            cardHeaderDiv.className = 'card-header';
            cardHeaderDiv.textContent = task.name;
            cardHeaderDiv.dataset.index = index;
            cardHeaderDiv.style.textAlign = 'center';


            const cardBodyDiv = document.createElement('div');
            cardBodyDiv.className = 'card-body';

            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title';
            cardTitle.textContent = task.email;
            cardTitle.style.textAlign = 'center';
            cardTitle.dataset.index = index;

            const cardText = document.createElement('p');
            cardText.className = 'card-text';
            cardText.textContent = task.phone;
            cardText.dataset.index = index;

            const cardCity = document.createElement('p');
            cardCity.className = 'card-text';
            cardCity.textContent = task.city;
            cardCity.dataset.index = index;

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'buttonsDivClass';

            const editbutton = document.createElement('button');
            editbutton.dataset.index = index;
            editbutton.textContent = 'Edit';
            editbutton.className = 'btn btn-dark edit';

            const deleteButton = document.createElement('button');
            deleteButton.dataset.index = index;
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'btn btn-dark delete';




            editbutton.addEventListener("click", async (e) => {
                if (e.target.classList.contains("edit")) {
                    const index = e.target.dataset.index;
                    const currentTask = array[index];

                    const { value: name } = await Swal.fire({
                        title: 'Edit your name',
                        input: 'text',
                        inputValue: currentTask.name,
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Name is required';
                            }
                        }
                    });

                    if (!name) return;

                    const { value: email } = await Swal.fire({
                        title: 'Edit your email',
                        input: 'text',
                        inputValue: currentTask.email,

                    });

                    if (!email) return;

                    const { value: phone } = await Swal.fire({
                        title: 'Edit your phone',
                        input: 'text',
                        inputValue: currentTask.phone,

                    });

                    if (!phone) return;

                    const { value: city } = await Swal.fire({
                        title: 'Edit your city',
                        input: 'text',
                        inputValue: currentTask.city,

                    });

                    if (!city) return;

                    array[index].name = name;
                    array[index].email = email;
                    array[index].phone = phone;
                    array[index].city = city;
                    localStorage.setItem("tasks", JSON.stringify(array));
                    renderTasks(array);
                }
            });

            deleteButton.addEventListener("click", async (e) => {
                if (e.target.classList.contains("delete")) {
                    const index = e.target.dataset.index;
                    array.splice(index, 1);
                    localStorage.setItem("tasks", JSON.stringify(tasks));
                    renderTasks(array);


                }
                enableWhenAnyRecords();
                deleteKeyIfEmpty();

            });

            cardBodyDiv.appendChild(cardTitle);
            cardBodyDiv.appendChild(cardText);
            cardBodyDiv.appendChild(cardCity);

            buttonsDiv.appendChild(editbutton);
            buttonsDiv.appendChild(deleteButton);
            cardDiv.appendChild(cardHeaderDiv);
            cardDiv.appendChild(cardBodyDiv);
            cardDiv.appendChild(buttonsDiv);

            const container = document.getElementById('main-card-container');
            container.appendChild(cardDiv);

        });

    }

    enableWhenAnyRecords();
    deleteKeyIfEmpty();
    renderTasks(tasks, '');




    async function getApiData() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }

            const data = await response.json();

            const apiTasks = data.map(user => ({
                name: user.name,
                city: user.address.city,
                email: user.email,
                phone: user.phone,
            }));

            tasks.push(...apiTasks);
            localStorage.setItem('tasks', JSON.stringify(tasks));

            renderTasks(tasks);
        } catch (error) {
            console.error('An error occurred while fetching data:', error);
            throw error;
        }
    }

    addFromAPIButtton.addEventListener("click", async () => {
        try {
            await getApiData();
        } catch (error) {
            console.error("An error occurred:", error);
        }
        enableWhenAnyRecords();
    });

    function deleteFromLocalStorage(key) {
        localStorage.removeItem(key);
    }

    filterInputButton.addEventListener("click", () => {
        renderTasks(tasks, filterInput.value);
    });

    resetFilter.addEventListener("click", () => {
        window.location.reload();
    });


    deleteLocalStorage.addEventListener("click", () => {
        deleteFromLocalStorage('tasks');
        window.location.reload();
    });

    addTaskButton.addEventListener("click", async () => {
        const { value: name } = await Swal.fire({
            title: 'Enter your name',
            input: 'text',
            inputValidator: (value) => {
                if (!value) {
                    return 'Name is required';
                }
            }
        });

        if (!name) return;

        const { value: city } = await Swal.fire({
            title: 'Enter your city',
            input: 'text',
            inputValidator: (value) => {
                if (!value) {
                    return 'City is required';
                }
            }
        });

        if (!city) return;


        const { value: email } = await Swal.fire({
            title: 'Enter your email',
            input: 'email',
            inputLabel: 'Your email address',
            inputPlaceholder: 'Enter your email address',
            inputValidator: (value) => {
                if (!value) {
                    return 'Email is required';
                }
            }
        })

        if (!email) return;

        const { value: phone } = await Swal.fire({
            title: 'Enter phone',
            input: 'text',
        });

        if (!phone) return;

        const newTask = { name, city, email, phone };
        tasks.push(newTask);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks(tasks);
        enableWhenAnyRecords();
    });

});



