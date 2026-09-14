/* ============================================================
   مدرسة الملك الكامل الثانوية
   RESULT DATA ENGINE

   File:
   result-data.js

   يحتوي على:
   Firebase
   Firestore
   البحث
   النتائج
   الدفع
   الكود السري
   الطباعة
   إدارة الواجهة
   ============================================================ */


/* ============================================================
   FIREBASE CONFIG
============================================================ */

const RESULT_FIREBASE_CONFIG = {

    apiKey:
        "AIzaSyCSwNiOHDC0m6zoBx_BeAGyaE33Zmhuvi4",

    authDomain:
        "hazoma-60ed2.firebaseapp.com",

    projectId:
        "hazoma-60ed2",

    storageBucket:
        "hazoma-60ed2.firebasestorage.app",

    messagingSenderId:
        "962438384604",

    appId:
        "1:962438384604:web:52db16e5723a8f6d3bdd19"

};


/* ============================================================
   GLOBAL STATE
============================================================ */

let RESULT_DB = null;

let currentGradeSettings = null;

let currentStudentData = null;


/* ============================================================
   GRADE TITLES
============================================================ */

const RESULT_GRADE_TITLES = {

    "1sec":
        "الصف الأول الثانوي",

    "2sec":
        "الصف الثاني الثانوي",

    "3sec":
        "الصف الثالث الثانوي"

};


/* ============================================================
   FIREBASE INITIALIZATION
============================================================ */

function initializeResultFirebase() {

    try {

        if (
            typeof firebase === "undefined"
        ) {

            throw new Error(
                "Firebase library was not loaded."
            );

        }


        if (
            !firebase.apps.length
        ) {

            firebase.initializeApp(
                RESULT_FIREBASE_CONFIG
            );

        }


        RESULT_DB =
            firebase.firestore();


        return true;

    }

    catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );


        RESULT_DB =
            null;


        return false;

    }

}


/* ============================================================
   DOM READY
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* --------------------------------------------
           INITIALIZE FIREBASE
        -------------------------------------------- */

        const firebaseReady =
            initializeResultFirebase();


        /* --------------------------------------------
           ELEMENTS
        -------------------------------------------- */

        const searchForm =
            document.getElementById(
                "searchForm"
            );


        const gradeSelect =
            document.getElementById(
                "searchGrade"
            );


        const printButton =
            document.getElementById(
                "printBtn"
            );


        const resetButton =
            document.getElementById(
                "resetBtn"
            );


        /* --------------------------------------------
           SEARCH FORM
        -------------------------------------------- */

        if (searchForm) {

            searchForm.addEventListener(
                "submit",
                handleSearch
            );

        }


        /* --------------------------------------------
           GRADE CHANGE
        -------------------------------------------- */

        if (gradeSelect) {

            gradeSelect.addEventListener(
                "change",
                checkGradeStatus
            );

        }


        /* --------------------------------------------
           PRINT
        -------------------------------------------- */

        if (printButton) {

            printButton.addEventListener(
                "click",
                printStudentCertificate
            );

        }


        /* --------------------------------------------
           RESET
        -------------------------------------------- */

        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetSearch
            );

        }


        /* --------------------------------------------
           FIREBASE STATUS
        -------------------------------------------- */

        if (!firebaseReady) {

            showStatusNotice(
                "ترقبوا إعلان النتائج",
                "يتعذر الاتصال بالسيرفر حالياً. يرجى إعادة المحاولة لاحقاً."
            );

            return;

        }


        /* --------------------------------------------
           INITIAL GRADE STATUS
        -------------------------------------------- */

        checkGradeStatus();

    }
);


/* ============================================================
   CHECK GRADE STATUS
============================================================ */

async function checkGradeStatus() {

    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    if (!gradeElement) {

        return;

    }


    const grade =
        String(
            gradeElement.value || ""
        ).trim();


    resetViews();


    currentGradeSettings =
        null;


    currentStudentData =
        null;


    /* --------------------------------------------
       FIREBASE CHECK
    -------------------------------------------- */

    if (!RESULT_DB) {

        showStatusNotice(
            "ترقبوا إعلان النتائج",
            "يتعذر الاتصال بالسيرفر حالياً. يرجى إعادة المحاولة لاحقاً."
        );

        return;

    }


    try {

        /* ----------------------------------------
           SETTINGS
        ---------------------------------------- */

        const configDoc =
            await RESULT_DB
                .collection(
                    `config_${grade}`
                )
                .doc(
                    "settings"
                )
                .get();


        /* ----------------------------------------
           NOT PUBLISHED
        ---------------------------------------- */

        if (
            !configDoc.exists
        ) {

            currentGradeSettings =
                null;


            showStatusNotice(

                "النتيجة لم ترفع بعد",

                `نتائج ${
                    RESULT_GRADE_TITLES[grade] || grade
                } غير متاحة حالياً. تجري الآن عمليات التصحيح والرصد، يرجى المتابعة لاحقاً.`

            );


            return;

        }


        const settings =
            configDoc.data();


        if (
            !settings ||
            settings.isPublished !== true
        ) {

            currentGradeSettings =
                null;


            showStatusNotice(

                "النتيجة لم ترفع بعد",

                `نتائج ${
                    RESULT_GRADE_TITLES[grade] || grade
                } غير متاحة حالياً. تجري الآن عمليات التصحيح والرصد، يرجى المتابعة لاحقاً.`

            );


            return;

        }


        /* ----------------------------------------
           PUBLISHED
        ---------------------------------------- */

        currentGradeSettings =
            settings;


        showStatusNotice(

            "النتائج معتمدة وجاهزة للاستعلام",

            `تم اعتماد نتيجة ${
                RESULT_GRADE_TITLES[grade] || grade
            } رسمياً. أدخل رقم الجلوس أو الكود السري للبحث.`,

            true

        );

    }

    catch (error) {

        console.error(
            "Grade status error:",
            error
        );


        currentGradeSettings =
            null;


        showStatusNotice(

            "ترقبوا إعلان النتائج",

            "يتعذر الاتصال بالسيرفر حالياً. يرجى إعادة المحاولة لاحقاً."

        );

    }

}


/* ============================================================
   SEARCH
============================================================ */

async function handleSearch(event) {

    if (event) {

        event.preventDefault();

    }


    const inputElement =
        document.getElementById(
            "searchInput"
        );


    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    const searchButton =
        document.getElementById(
            "searchBtn"
        );


    if (
        !inputElement ||
        !gradeElement ||
        !searchButton
    ) {

        return;

    }


    const inputValue =
        String(
            inputElement.value || ""
        ).trim();


    const grade =
        String(
            gradeElement.value || ""
        ).trim();


    if (!inputValue) {

        return;

    }


    /* --------------------------------------------
       CHECK FIREBASE
    -------------------------------------------- */

    if (!RESULT_DB) {

        alert(
            "يتعذر الاتصال بالسيرفر حالياً. يرجى إعادة المحاولة لاحقاً."
        );

        return;

    }


    /* --------------------------------------------
       CHECK PUBLISH STATUS
    -------------------------------------------- */

    if (
        !currentGradeSettings ||
        currentGradeSettings.isPublished !== true
    ) {

        alert(
            "النتيجة غير متاحة للصف المحدد حالياً."
        );

        return;

    }


    /* --------------------------------------------
       LOADING
    -------------------------------------------- */

    searchButton.disabled =
        true;


    searchButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> جاري البحث...';


    resetViews();


    try {

        let student =
            null;


        /* ====================================================
           FIRST:
           MAPPING
        ==================================================== */

        const mappingDocument =
            await RESULT_DB
                .collection(
                    `mapping_${grade}`
                )
                .doc(
                    inputValue
                )
                .get();


        if (
            mappingDocument.exists
        ) {

            student =
                mappingDocument.data();

        }


        /* ====================================================
           SECOND:
           RESULTS
        ==================================================== */

        else {

            const resultDocument =
                await RESULT_DB
                    .collection(
                        `results_${grade}`
                    )
                    .doc(
                        inputValue
                    )
                    .get();


            if (
                resultDocument.exists
            ) {

                student =
                    resultDocument.data();

            }

        }


        /* ====================================================
           NOT FOUND
        ==================================================== */

        if (!student) {

            const notFound =
                document.getElementById(
                    "notFoundNotice"
                );


            if (notFound) {

                notFound.classList.remove(
                    "hidden"
                );

            }


            return;

        }


        /* ====================================================
           PAYMENT
        ==================================================== */

        if (
            student.paymentRequired === true &&
            student.isPaid !== true
        ) {

            const amount =
                document.getElementById(
                    "payAmount"
                );


            if (amount) {

                amount.innerText =
                    student.amount ??
                    "0";

            }


            const payment =
                document.getElementById(
                    "paymentNotice"
                );


            if (payment) {

                payment.classList.remove(
                    "hidden"
                );

            }


            return;

        }


        /* ====================================================
           SECRET CODE
        ==================================================== */

        const studentSecret =
            student.secretID !== undefined &&
            student.secretID !== null

                ? String(
                    student.secretID
                ).trim()

                : "";


        const enteredValue =
            String(
                inputValue
            ).trim();


        if (
            studentSecret !== "" &&
            enteredValue !== studentSecret
        ) {

            const withheld =
                document.getElementById(
                    "withheldNotice"
                );


            if (withheld) {

                withheld.classList.remove(
                    "hidden"
                );

            }


            return;

        }


        /* ====================================================
           DISPLAY RESULT
        ==================================================== */

        displayResult(
            student
        );

    }


    catch (error) {

        console.error(
            "Search error:",
            error
        );


        alert(
            "حدث خطأ أثناء جلب البيانات: " +
            (
                error &&
                error.message
                    ? error.message
                    : "خطأ غير معروف"
            )
        );

    }


    finally {

        searchButton.disabled =
            false;


        searchButton.innerHTML =
            '<i class="fas fa-graduation-cap"></i> عرض النتيجة الان';

    }

}


/* ============================================================
   GET SCORE COLUMNS
============================================================ */

function getScoreColumns(student) {

    const scores =
        student &&
        student.scores &&
        typeof student.scores === "object"

            ? student.scores

            : {};


    if (
        currentGradeSettings &&
        Array.isArray(
            currentGradeSettings.displayColumns
        ) &&
        currentGradeSettings.displayColumns.length
    ) {

        return currentGradeSettings.displayColumns;

    }


    return Object.keys(
        scores
    );

}


/* ============================================================
   GET SCORE VALUE
============================================================ */

function getScoreValue(
    scores,
    column
) {

    if (
        !scores ||
        typeof scores !== "object"
    ) {

        return "-";

    }


    if (
        !Object.prototype.hasOwnProperty.call(
            scores,
            column
        )
    ) {

        return "-";

    }


    const value =
        scores[column];


    if (
        value === null ||
        value === undefined
    ) {

        return "-";

    }


    if (
        String(value).trim() === ""
    ) {

        return "-";

    }


    return value;

}


/* ============================================================
   DISPLAY RESULT
============================================================ */

function displayResult(student) {

    currentStudentData =
        student;


    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    const gradeKey =
        student.grade ||
        (
            gradeElement
                ? gradeElement.value
                : ""
        );


    /* --------------------------------------------
       NAME
    -------------------------------------------- */

    const studentName =
        document.getElementById(
            "resStudentName"
        );


    if (studentName) {

        studentName.innerText =
            student.name ??
            "-";

    }


    /* --------------------------------------------
       GRADE
    -------------------------------------------- */

    const gradeTitle =
        document.getElementById(
            "resGradeTitle"
        );


    if (gradeTitle) {

        gradeTitle.innerText =
            RESULT_GRADE_TITLES[gradeKey] ||
            gradeKey ||
            "-";

    }


    /* --------------------------------------------
       SEAT
    -------------------------------------------- */

    const seat =
        document.getElementById(
            "resSeatID"
        );


    if (seat) {

        seat.innerText =
            student.seatID ??
            "-";

    }


    /* --------------------------------------------
       SECRET
    -------------------------------------------- */

    const secret =
        document.getElementById(
            "resSecretID"
        );


    if (secret) {

        secret.innerText =
            student.secretID ??
            "-";

    }


    /* --------------------------------------------
       SCORES
    -------------------------------------------- */

    const grid =
        document.getElementById(
            "scoresGrid"
        );


    if (!grid) {

        return;

    }


    grid.innerHTML =
        "";


    const scores =
        student.scores &&
        typeof student.scores === "object"

            ? student.scores

            : {};


    const columns =
        getScoreColumns(
            student
        );


    /* --------------------------------------------
       NO SCORES
    -------------------------------------------- */

    if (!columns.length) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "col-span-full text-center text-slate-400 p-6 font-bold";


        empty.innerText =
            "لا توجد درجات مسجلة حالياً.";


        grid.appendChild(
            empty
        );

    }


    /* --------------------------------------------
       BUILD SCORE CARDS
    -------------------------------------------- */

    columns.forEach(
        function (column) {

            const score =
                getScoreValue(
                    scores,
                    column
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1";


            const title =
                document.createElement(
                    "span"
                );


            title.className =
                "block text-[11px] font-bold text-slate-400 truncate";


            title.title =
                String(
                    column
                );


            title.innerText =
                String(
                    column
                );


            const scoreElement =
                document.createElement(
                    "span"
                );


            scoreElement.className =
                "text-lg font-black text-amber-400 font-mono";


            scoreElement.innerText =
                String(
                    score
                );


            card.appendChild(
                title
            );


            card.appendChild(
                scoreElement
            );


            grid.appendChild(
                card
            );

        }
    );


    /* --------------------------------------------
       SHOW RESULT
    -------------------------------------------- */

    const resultCard =
        document.getElementById(
            "resultCard"
        );


    if (resultCard) {

        resultCard.classList.remove(
            "hidden"
        );

    }

}


/* ============================================================
   PRINT CERTIFICATE
============================================================ */

function printStudentCertificate() {

    if (!currentStudentData) {

        return;

    }


    const student =
        currentStudentData;


    const gradeElement =
        document.getElementById(
            "searchGrade"
        );


    const gradeKey =
        student.grade ||
        (
            gradeElement
                ? gradeElement.value
                : ""
        );


    /* --------------------------------------------
       NAME
    -------------------------------------------- */

    const pName =
        document.getElementById(
            "pName"
        );


    if (pName) {

        pName.innerText =
            student.name ??
            "-";

    }


    /* --------------------------------------------
       GRADE
    -------------------------------------------- */

    const pGrade =
        document.getElementById(
            "pGrade"
        );


    if (pGrade) {

        pGrade.innerText =
            RESULT_GRADE_TITLES[gradeKey] ||
            gradeKey ||
            "-";

    }


    /* --------------------------------------------
       SEAT
    -------------------------------------------- */

    const pSeat =
        document.getElementById(
            "pSeat"
        );


    if (pSeat) {

        pSeat.innerText =
            student.seatID ??
            "-";

    }


    /* --------------------------------------------
       SECRET
    -------------------------------------------- */

    const pSecret =
        document.getElementById(
            "pSecret"
        );


    if (pSecret) {

        pSecret.innerText =
            student.secretID ??
            "-";

    }


    /* --------------------------------------------
       TABLE
    -------------------------------------------- */

    const tableBody =
        document.getElementById(
            "pTableBody"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML =
        "";


    const scores =
        student.scores &&
        typeof student.scores === "object"

            ? student.scores

            : {};


    const columns =
        getScoreColumns(
            student
        );


    /* --------------------------------------------
       TABLE ROWS
    -------------------------------------------- */

    columns.forEach(
        function (column) {

            const score =
                getScoreValue(
                    scores,
                    column
                );


            const row =
                document.createElement(
                    "tr"
                );


            const subjectCell =
                document.createElement(
                    "td"
                );


            subjectCell.style.fontWeight =
                "700";


            subjectCell.innerText =
                String(
                    column
                );


            const scoreCell =
                document.createElement(
                    "td"
                );


            scoreCell.style.fontWeight =
                "900";


            scoreCell.style.color =
                "#1e3a8a";


            scoreCell.innerText =
                String(
                    score
                );


            row.appendChild(
                subjectCell
            );


            row.appendChild(
                scoreCell
            );


            tableBody.appendChild(
                row
            );

        }
    );


    /* --------------------------------------------
       PRINT
    -------------------------------------------- */

    setTimeout(
        function () {

            window.print();

        },
        100
    );

}


/* ============================================================
   STATUS NOTICE
============================================================ */

function showStatusNotice(
    title,
    message,
    isReady = false
) {

    const notice =
        document.getElementById(
            "statusNotice"
        );


    const titleElement =
        document.getElementById(
            "statusTitle"
        );


    const messageElement =
        document.getElementById(
            "statusMsg"
        );


    if (
        !notice ||
        !titleElement ||
        !messageElement
    ) {

        return;

    }


    titleElement.innerText =
        title;


    messageElement.innerText =
        message;


    /* --------------------------------------------
       READY
    -------------------------------------------- */

    if (isReady) {

        notice.classList.add(
            "border-emerald-500/30"
        );


        titleElement.className =
            "text-2xl font-black text-emerald-400";

    }


    /* --------------------------------------------
       NOT READY
    -------------------------------------------- */

    else {

        notice.classList.remove(
            "border-emerald-500/30"
        );


        titleElement.className =
            "text-3xl font-black text-amber-400";

    }


    notice.classList.remove(
        "hidden"
    );

}


/* ============================================================
   RESET VIEWS
============================================================ */

function resetViews() {

    const elements = [

        "statusNotice",

        "resultCard",

        "paymentNotice",

        "notFoundNotice",

        "withheldNotice"

    ];


    elements.forEach(
        function (id) {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* ============================================================
   RESET SEARCH
============================================================ */

function resetSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (input) {

        input.value =
            "";

    }


    currentStudentData =
        null;


    resetViews();


    checkGradeStatus();

}


/* ============================================================
   EXPORT
   للحفاظ على أي استدعاء خارجي
============================================================ */

window.checkGradeStatus =
    checkGradeStatus;


window.handleSearch =
    handleSearch;


window.displayResult =
    displayResult;


window.printStudentCertificate =
    printStudentCertificate;


window.resetViews =
    resetViews;


window.resetSearch =
    resetSearch;
