const array = [1, 2, 3, 4, 5]
for (let index = 0; index < array.length; index++) {
    const element = array[index];
    console.log(element, 'element');
    setTimeout(() => {
        let arr = array[index]
        console.log(arr);
    }, 100)
}