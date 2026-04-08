function display(setId) {
    // 1. Find all image sets
    const allSets = document.querySelectorAll('.images');

    // 2. Remove the 'active' class from every set
    allSets.forEach(set => {
        set.classList.remove('active');
    });

    // 3. Add the 'active' class to the specific set clicked
    const selectedSet = document.getElementById(setId);
    if (selectedSet) {
        selectedSet.classList.add('active');
    }
}