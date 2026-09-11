const fileInput = document.getElementById("fileInput");
const uploadBox = document.getElementById("uploadBox");
const editor = document.getElementById("editor");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cropButton = document.getElementById("cropButton");
const downloadButton = document.getElementById("downloadButton");

const formatButtons = document.querySelectorAll(".formats button");

let image = new Image();
let ratio = null;

let crop = {
    x: 0,
    y: 0,
    width: 300,
    height: 300
};

let dragging = false;
let resizing = false;
let resizeDirection = "";

let startMouse = {
    x: 0,
    y: 0
};

let startCrop = {};


fileInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        image.onload = function () {

            canvas.width = image.width;
            canvas.height = image.height;

            crop.width = Math.min(500, image.width);
            crop.height = Math.min(500, image.height);

            crop.x = (image.width - crop.width) / 2;
            crop.y = (image.height - crop.height) / 2;

            draw();

            uploadBox.classList.add("hidden");
            editor.classList.remove("hidden");

        };

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
});


// ===============================
// DRAW
// ===============================

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Затемнение
    ctx.fillStyle = "rgba(0,0,0,0.55)";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        crop.y
    );

    ctx.fillRect(
        0,
        crop.y,
        crop.x,
        crop.height
    );

    ctx.fillRect(
        crop.x + crop.width,
        crop.y,
        canvas.width - crop.x - crop.width,
        crop.height
    );

    ctx.fillRect(
        0,
        crop.y + crop.height,
        canvas.width,
        canvas.height - crop.y - crop.height
    );


    // Рамка
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;

    ctx.strokeRect(
        crop.x,
        crop.y,
        crop.width,
        crop.height
    );


    // Сетка
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        crop.x + crop.width / 3,
        crop.y
    );

    ctx.lineTo(
        crop.x + crop.width / 3,
        crop.y + crop.height
    );

    ctx.moveTo(
        crop.x + crop.width * 2 / 3,
        crop.y
    );

    ctx.lineTo(
        crop.x + crop.width * 2 / 3,
        crop.y + crop.height
    );

    ctx.moveTo(
        crop.x,
        crop.y + crop.height / 3
    );

    ctx.lineTo(
        crop.x + crop.width,
        crop.y + crop.height / 3
    );

    ctx.moveTo(
        crop.x,
        crop.y + crop.height * 2 / 3
    );

    ctx.lineTo(
        crop.x + crop.width,
        crop.y + crop.height * 2 / 3
    );

    ctx.stroke();


    // Ручки
    drawHandle(crop.x, crop.y);
    drawHandle(crop.x + crop.width, crop.y);
    drawHandle(crop.x, crop.y + crop.height);
    drawHandle(crop.x + crop.width, crop.y + crop.height);

    // Центры сторон
    drawHandle(
        crop.x + crop.width / 2,
        crop.y
    );

    drawHandle(
        crop.x + crop.width / 2,
        crop.y + crop.height
    );

    drawHandle(
        crop.x,
        crop.y + crop.height / 2
    );

    drawHandle(
        crop.x + crop.width,
        crop.y + crop.height / 2
    );
}


function drawHandle(x, y) {

    ctx.fillStyle = "white";

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ===============================
// MOUSE POSITION
// ===============================

function getMousePosition(event) {

    const rect = canvas.getBoundingClientRect();

    return {
        x: (event.clientX - rect.left) *
            (canvas.width / rect.width),

        y: (event.clientY - rect.top) *
            (canvas.height / rect.height)
    };
}


// ===============================
// FIND HANDLE
// ===============================

function getResizeDirection(x, y) {

    const size = 25;

    const left =
        Math.abs(x - crop.x) < size;

    const right =
        Math.abs(x - (crop.x + crop.width)) < size;

    const top =
        Math.abs(y - crop.y) < size;

    const bottom =
        Math.abs(y - (crop.y + crop.height)) < size;


    if (left && top) return "top-left";
    if (right && top) return "top-right";

    if (left && bottom) return "bottom-left";
    if (right && bottom) return "bottom-right";

    if (top) return "top";
    if (bottom) return "bottom";

    if (left) return "left";
    if (right) return "right";

    return "";
}


// ===============================
// MOUSE DOWN
// ===============================

canvas.addEventListener("mousedown", function (event) {

    const mouse = getMousePosition(event);

    const direction =
        getResizeDirection(mouse.x, mouse.y);

    startMouse = mouse;

    startCrop = {
        x: crop.x,
        y: crop.y,
        width: crop.width,
        height: crop.height
    };


    if (direction) {

        resizing = true;
        dragging = false;

        resizeDirection = direction;

    }

    else if (
        mouse.x >= crop.x &&
        mouse.x <= crop.x + crop.width &&
        mouse.y >= crop.y &&
        mouse.y <= crop.y + crop.height
    ) {

        dragging = true;
        resizing = false;

    }

});


// ===============================
// MOUSE MOVE
// ===============================

canvas.addEventListener("mousemove", function (event) {

    const mouse = getMousePosition(event);

    if (!dragging && !resizing) {

        const direction =
            getResizeDirection(mouse.x, mouse.y);

        if (
            direction === "left" ||
            direction === "right"
        ) {
            canvas.style.cursor = "ew-resize";
        }

        else if (
            direction === "top" ||
            direction === "bottom"
        ) {
            canvas.style.cursor = "ns-resize";
        }

        else if (
            direction === "top-left" ||
            direction === "bottom-right"
        ) {
            canvas.style.cursor = "nwse-resize";
        }

        else if (
            direction === "top-right" ||
            direction === "bottom-left"
        ) {
            canvas.style.cursor = "nesw-resize";
        }

        else {
            canvas.style.cursor = "default";
        }

        return;
    }


    // ===========================
    // MOVE CROP
    // ===========================

    if (dragging) {

        const dx =
            mouse.x - startMouse.x;

        const dy =
            mouse.y - startMouse.y;

        crop.x =
            startCrop.x + dx;

        crop.y =
            startCrop.y + dy;


        // Не выходить за изображение

        crop.x = Math.max(
            0,
            Math.min(
                crop.x,
                canvas.width - crop.width
            )
        );

        crop.y = Math.max(
            0,
            Math.min(
                crop.y,
                canvas.height - crop.height
            )
        );

        draw();

        return;
    }


    // ===========================
    // RESIZE
    // ===========================

    if (resizing) {

        const dx =
            mouse.x - startMouse.x;

        const dy =
            mouse.y - startMouse.y;


        let newX = startCrop.x;
        let newY = startCrop.y;

        let newWidth = startCrop.width;
        let newHeight = startCrop.height;


        // LEFT

        if (
            resizeDirection.includes("left")
        ) {

            newX =
                startCrop.x + dx;

            newWidth =
                startCrop.width - dx;

            if (newX < 0) {

                newWidth += newX;
                newX = 0;
            }
        }


        // RIGHT

        if (
            resizeDirection.includes("right")
        ) {

            newWidth =
                startCrop.width + dx;

            if (
                newX + newWidth >
                canvas.width
            ) {

                newWidth =
                    canvas.width - newX;
            }
        }


        // TOP

        if (
            resizeDirection.includes("top")
        ) {

            newY =
                startCrop.y + dy;

            newHeight =
                startCrop.height - dy;

            if (newY < 0) {

                newHeight += newY;
                newY = 0;
            }
        }


        // BOTTOM

        if (
            resizeDirection.includes("bottom")
        ) {

            newHeight =
                startCrop.height + dy;

            if (
                newY + newHeight >
                canvas.height
            ) {

                newHeight =
                    canvas.height - newY;
            }
        }


        // Минимальный размер

        if (newWidth < 30) {

            newWidth = 30;

            if (
                resizeDirection.includes("left")
            ) {
                newX =
                    startCrop.x +
                    startCrop.width -
                    30;
            }
        }

        if (newHeight < 30) {

            newHeight = 30;

            if (
                resizeDirection.includes("top")
            ) {
                newY =
                    startCrop.y +
                    startCrop.height -
                    30;
            }
        }


        crop.x = newX;
        crop.y = newY;
        crop.width = newWidth;
        crop.height = newHeight;

        draw();
    }

});


// ===============================
// MOUSE UP
// ===============================

window.addEventListener("mouseup", function () {

    dragging = false;
    resizing = false;
    resizeDirection = "";

});


// ===============================
// FORMAT BUTTONS
// ===============================

formatButtons.forEach(button => {

    button.addEventListener("click", function () {

        formatButtons.forEach(
            b => b.classList.remove("active")
        );

        this.classList.add("active");

        const value =
            this.dataset.ratio;


        if (value === "free") {

            ratio = null;

            return;
        }


        ratio = parseFloat(value);

        crop.height =
            crop.width / ratio;


        if (
            crop.height >
            canvas.height
        ) {

            crop.height =
                canvas.height;

            crop.width =
                crop.height * ratio;
        }


        if (
            crop.width >
            canvas.width
        ) {

            crop.width =
                canvas.width;

            crop.height =
                crop.width / ratio;
        }


        crop.x =
            (canvas.width - crop.width) / 2;

        crop.y =
            (canvas.height - crop.height) / 2;


        draw();
    });

});


// ===============================
// CROP
// ===============================

cropButton.addEventListener(
    "click",
    function () {

        const output =
            document.createElement("canvas");

        output.width =
            Math.round(crop.width);

        output.height =
            Math.round(crop.height);


        const outputCtx =
            output.getContext("2d");


        outputCtx.drawImage(
            image,

            crop.x,
            crop.y,
            crop.width,
            crop.height,

            0,
            0,
            output.width,
            output.height
        );


        canvas.width =
            output.width;

        canvas.height =
            output.height;


        ctx.drawImage(
            output,
            0,
            0
        );


        downloadButton.classList.remove(
            "hidden"
        );
    }
);


// ===============================
// DOWNLOAD
// ===============================

downloadButton.addEventListener(
    "click",
    function () {

        const link =
            document.createElement("a");

        link.download =
            "cropped-image.png";

        link.href =
            canvas.toDataURL(
                "image/png"
            );

        link.click();
    }
);