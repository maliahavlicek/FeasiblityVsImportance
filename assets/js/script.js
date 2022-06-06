/*
    KEY COMPONENTS:
    "feature-list" = Will contain list of features. Used for managing features.
    PROCESS:
    1 - User fills in Feature form: Feature Name, Feasibility, Importance
    2 - User Submits Features (clicks Add button)
    3 - Javascript verifies entry
    4 - store as JSON string in members hidden input
    5 - build HTML for display in features-list
 */


/* constants to help adjust bulleye ranges */
const inDistFromTopRight = 1.75;
const maybeDistFromTopRight = 3.75;

/* helper function to get list of members */
function get_features() {
    // hidden input containing features that is sent to plot
    const list = document.getElementById('id-features-list');
    let list_value;
    try {
        if (list.value !== null && list.value !== "") {
            list_value = JSON.parse(list.value);
        } else {
            list_value = []
        }
    } catch (e) {
        list_value = []
    }
    return list_value;
}

/* create HTML for list of members for UI */
function feature_list() {
    // hidden input containing members that is sent with Create Challenge
    let list = get_features();
    // features html output container
    const feature_block = document.getElementById('features-html');
    if (list.length > 0) {
        feature_block.innerHTML = `
                    <div class="border p-1 text-upper">Feature Name</div>
                    <div class="border p-1 text-upper">Feasibility</div>
                    <div class="border p-1 text-upper">Importance</div>
                    <div class="border p-1 text-upper">Remove</div>
                     `;
        for (let i in list) {

            let item = `                  
                     <div class="border p-1" id="feature-row-${list[i].slug}">${list[i].feature_name}</div>
                     <div class="border p-1 text-center">${list[i].feasibility}</div>
                     <div class="border p-1 text-center">${list[i].importance}</div>
                     <div class="border p-1 text-center">
                      <a tabindex=0" onclick="remove('${list[i].slug}');" class="btn freature-remove">X</a>
                     </div>
                `;
            feature_block.innerHTML += item;
        }
    } else {
        feature_block.innerHTML = '';
    }


}


/* Remove Member from list */
function remove(slug) {
    let list = get_features();

    list = $.grep(list, function (e) {
        return e.slug !== slug;
    });
    document.getElementById('id-features-list').value = JSON.stringify(list);
    max_feature_messaging();
    feature_list();

}


/* send request out to validate Member Form and to then add result to  member_list */
function add_feature() {
    const list = get_features();
    const max_features = parseInt(document.getElementById('max-features').value);
    // if exceeds max members, ignore input
    if (list.length < max_features) {

        //pull email from input
        const feature_name = document.getElementById('feature-name').value.trim();
        const slug = feature_name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, '').replace(/[ ]/g, '-');

        //make sure it's valid first

        // Check that slug is not already in list
        const slugInList = objectPropInArray(list, 'slug', slug);
        const feasibility = document.getElementById('feasibility').value;
        const importance = document.getElementById('importance').value;
        let has_error = false;
        if (parseFloat(feasibility) < 0 || parseFloat(feasibility) > 5) {
            has_error = true;
            document.getElementById('feasibility').focus();
            document.getElementById('feasibility').classList.add('is-invalid');
            document.getElementById('error-feasibility').classList.add('invalid-feedback');
            document.getElementById('error-feasibility').innerHTML = 'Values between 0 and 5.';
        } else {
            document.getElementById('feasibility').classList.remove('is-invalid');
            document.getElementById('error-feasibility').classList.remove('invalid-feedback');
            document.getElementById('error-feasibility').innerHTML = '';
        }
        if (parseFloat(importance) < 0 || parseFloat(importance) > 5) {
            has_error = true;
            document.getElementById('importance').focus();
            document.getElementById('importance').classList.add('is-invalid');
            document.getElementById('error-importance').classList.add('invalid-feedback');
            document.getElementById('error-importance').innerHTML = 'Values between 0 and 5 please.';
        } else {
            document.getElementById('importance').classList.remove('is-invalid');
            document.getElementById('error-importance').classList.remove('invalid-feedback');
            document.getElementById('error-importance').innerHTML = '';
        }
        if (slugInList || feature_name.replaceAll(' ', '').length === 0) {
            has_error = true;
            //feature's slug already in list
            document.getElementById('feature-name').focus();
            document.getElementById('feature-name').classList.add('is-invalid');
            document.getElementById('error-feature-name').classList.add('invalid-feedback');
            if (feature_name.replaceAll(' ', '').length === 0) {
                document.getElementById('error-feature-name').innerHTML = 'Feature Name cannot be just spaces.';
            } else {
                document.getElementById('error-feature-name').innerHTML = '<strong>Entry already in list.</strong>Note: Special characters are stripped off for uniqueness check';
            }
        } else {
            document.getElementById('feature-name').classList.remove('is-invalid');
            document.getElementById('error-feature-name').classList.remove('invalid-feedback');
            document.getElementById('error-feature-name').innerHTML = '';

        }

        // add it to the list if no errors
        if (!has_error) {

            //clear out entry forms
            document.getElementById('feature-name').value = '';
            document.getElementById('feasibility').value = '';
            document.getElementById('importance').value = '';

            //stuff result into list
            list.push({
                'slug': slug,
                'feature_name': feature_name,
                'importance': importance,
                'feasibility': feasibility,
            });
            // set CreateChallengeFrom members value
            document.getElementById('id-features-list').value = JSON.stringify(list);

            // update list displayed on page
            feature_list();
        }

    }
    // see if messaging needs to be shown
    max_feature_messaging();
}

/* helper function to hide show max member messaging */
function max_feature_messaging() {
    const list = get_features();

    const add_btn = document.getElementById('add-feature');
    const mem_list_errs = document.getElementById('feature-list-errors');
    const err_mem_list = document.getElementById('error-feature-list');
    const feature_inputs = document.getElementsByClassName('feature-entry');
    const max_features = parseInt(document.getElementById('max-features').value);
    if (list.length >= max_features) {
        add_btn.classList.add('is-disabled');
        add_btn.setAttribute('disabled', true);
        mem_list_errs.classList.add('is-invalid');
        err_mem_list.classList.add('invalid-feedback');
        err_mem_list.innerHTML = '<strong>You have reached the max number of features.</strong>';
        err_mem_list.style.display = "block";
        Array.prototype.forEach.call(feature_inputs, function (item) {
            item.style.display = "none";
            if (item.classList.contains('d-none')) {
                item.classList.remove('d-md-block');
            }
        });

    } else {
        if (add_btn.classList.contains('is-disabled')) {
            add_btn.classList.remove('is-disabled');
            add_btn.removeAttribute('disabled');
        }
        if (mem_list_errs.classList.contains('is-invalid')) {
            mem_list_errs.classList.remove('is-invalid');
        }
        if (err_mem_list.classList.contains('invalid-feedback')) {
            err_mem_list.classList.remove('invalid-feedback');
        }
        err_mem_list.innerHTML = '';
        err_mem_list.style.display = "none";
        Array.prototype.forEach.call(feature_inputs, function (item) {
            item.style.display = "block";
            if (item.classList.contains('d-none')) {
                item.classList.add('d-md-block');
            }
        });
    }
}


/* Helper Function to check if an array of dictionaries has a property of a certain value */
function objectPropInArray(list, prop, val) {
    try {
        if (list.length > 0) {
            for (i in list) {
                if (list[i][prop] === val) {
                    return true;
                }
            }
        }
        return false;
    } catch (e) {
        return false;
    }
}

/* when page loads due to potential errors in create form, should check for members */
document.addEventListener("DOMContentLoaded", function () {
    feature_list();
});

function chartIt() {
    const raw_data = get_features();
    let chartData = []
    let ins = [];
    let outs = [];
    let maybes = [];

    raw_data.forEach(item => {
        const color = getColor(parseFloat(item.importance), parseFloat(item.feasibility));
        if (color === 'red') {
            ins.push({
                x: parseFloat(item.importance),
                y: parseFloat(item.feasibility)
            })
        } else if (color == 'blue') {
            maybes.push({
                x: parseFloat(item.importance),
                y: parseFloat(item.feasibility)
            })
        } else {
            outs.push({
                x: parseFloat(item.importance),
                y: parseFloat(item.feasibility)
            })

        }
    });

    // bulls-eye-background
    const bullsEyeBackground = {
        id: 'curves',
        beforeDraw(chart, args, options) {
            const {ctx, chartArea: {top, bottom, left, right, width, height}} = chart;
            ctx.save();

            // features in quadrant
            ctx.beginPath();
            let radius = height / 5 * inDistFromTopRight;
            let centerx = right;
            let centery = top;
            let offset = Math.PI / 2;

            ctx.moveTo(centerx, centery);
            let arcsector = Math.PI * (2 * .25);
            let lastend = 2 * arcsector;
            ctx.arc(centerx, centery, radius, lastend - offset, lastend + arcsector - offset, false);
            ctx.lineTo(centerx, centery);
            ctx.fillStyle = 'rgba(200, 0, 0, 0.2)';
            ctx.fill();
            ctx.closePath();

            // features maybe quadrant
            ctx.beginPath();
            radius = height / 5 * maybeDistFromTopRight;
            centerx = right;
            centery = top;
            offset = Math.PI / 2;
            ctx.moveTo(centerx, centery);
            arcsector = Math.PI * (2 * .25);
            lastend = 2 * arcsector;
            ctx.arc(centerx, centery, radius, lastend - offset, lastend + arcsector - offset, false);
            ctx.lineTo(centerx, centery);
            ctx.fillStyle = 'rgba(54, 162, 235, 0.2)';
            ctx.fill();
            ctx.closePath();

            // rest of grid, features not doing
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = '#E5E5E5';
            ctx.fillRect(left, top, width, height);
            ctx.restore();
        }
    };

    const data = {
        datasets: [{
            label: 'Features to Build',
            data: ins,
            borderColor: 'rgba(200, 0, 0)',
            backgroundColor: 'rgba(200, 0, 0)',
        }, {
            label: 'Features to Contemplate',
            data: maybes,
            borderColor: 'rgba(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235)',
        }, {
            label: 'Features to Skip',
            data: outs,
            borderColor: 'rgba(0, 0, 0)',
            backgroundColor: 'rgba(0, 0, 0)',
        }, {
            data: [
                {x: 5, y: 6.75},
                {x: 4.047963056, y: 3.531624824},
                {x: 6.597654189, y: 5.714143608},
                {x: 3.270944658, y: 5.269940037},
                {x: 6.303948031, y: 3.832858392},
                {x: 4.540844006, y: 6.68869055},
                {x: 4.466581413, y: 3.333277284},
                {x: 6.354308693, y: 6.108308605},
                {x: 3.260694856, y: 4.806822323},
                {x: 6.564494161, y: 4.215871172},
                {x: 4.113860128, y: 6.509058027},
                {x: 4.922575313, y: 3.251713577},
                {x: 6.016069572, y: 6.424816698},
                {x: 3.372314587, y: 4.357240172},
                {x: 6.715419404, y: 4.653826245},
                {x: 3.748966248, y: 6.223688911},
                {x: 5.383994202, y: 3.292648703},
                {x: 5.606636547, y: 6.641490816},
                {x: 3.597982887, y: 3.952694879},
                {x: 6.746148738, y: 5.116037002},
                {x: 3.47172973, y: 5.852578431},
                {x: 5.818507407, y: 3.453214422},
                {x: 5.154697747, y: 6.743149049},
                {x: 3.921887643, y: 3.621532102},
                {x: 6.654529021, y: 5.570117285},
                {x: 3.301575966, y: 5.421729534},
                {x: 6.195669482, y: 3.722160225},
                {x: 4.691919594, y: 6.722668414},
                {x: 4.321333514, y: 3.386955735},
                {x: 6.446979859, y: 5.984250622},
                {x: 3.25042728, y: 4.961330916},
                {x: 6.489053455, y: 4.080641633},
                {x: 4.250728001, y: 6.581483946},
                {x: 4.768332149, y: 3.265402062},
                {x: 6.138043795, y: 6.329419543},
                {x: 3.321867556, y: 4.503641761},
                {x: 6.678102516, y: 4.50354059}
            ]
        }],
    };

    console.log(data)

    // clean out any existing chart

    let chart = Chart.getChart("feasibility-chart"); // <canvas> id
    if (chart != undefined) {
        removeData(chart);
        addData(chart, data);
    } else {
        new Chart("feasibility-chart", {
            type: 'scatter',
            data: data,
            options: {
                scales: {
                    x: {
                        min: 0,
                        max: 5,
                        title: {
                            color: 'black',
                            display: true,
                            text: 'Importance'
                        },
                        ticks: {
                            min: 6,
                            max: 6,
                            scaleStepWidth: 1,
                            stepSize: 1,
                        },
                        beginAtZero: true,
                        grid: {
                            color: '#000',
                            drawBorder: false
                        },
                    },
                    y: {
                        min: 0,
                        max: 5,
                        title: {
                            color: 'black',
                            display: true,
                            text: 'Feasibility'
                        },
                        ticks: {
                            min: 6,
                            max: 6,
                            scaleStepWidth: 1,
                            stepSize: 1,
                        },
                        beginAtZero: true,
                        grid: {
                            color: '#000',
                            drawBorder: false
                        },
                    },

                },
                maintainAspectRatio: false,
                responsive: true,
                aspectRatio: 1,
            },
            plugins: [bullsEyeBackground],
        });
    }


}

function addData(chart) {
    const raw_data = get_features();

    raw_data.forEach(item => {
        const color = getColor(parseFloat(item.importance), parseFloat(item.feasibility));
        if (color === 'red') {
            chart.data.datasets[0].data.push({
                x: parseFloat(item.importance),
                y: parseFloat(item.feasibility)
            })
        } else if (color == 'blue') {
            chart.data.datasets[1].data.push({
                x: parseFloat(item.importance),
                y: parseFloat(item.feasibility)
            })
        } else {
            chart.data.datasets[2].data.push({
                x: parseFloat(item.importance),
                y: parseFloat(item.feasibility)
            })

        }
    });
    chart.update();
}

function removeData(chart) {
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
}


function getColor(x, y) {
    let distFromTopRight = Math.sqrt(((5 - parseFloat(x)) ** 2) + ((5 - parseFloat(y)) ** 2));
    if (distFromTopRight < inDistFromTopRight) {
        return 'red'; //  in
    } else if (distFromTopRight < maybeDistFromTopRight) {
        return 'blue'; // maybe
    } else {
        return 'gray'; // out
    }
}