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
