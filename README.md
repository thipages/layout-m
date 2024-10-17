# list-m

`list-m` is a custom element which allows to use [dry-html](https://github.com/thipages/dry-html) in a more compact syntax for managing list of "instances" of one `dry-html` template.

## Example

```html
<template id="a-template">
    <div>
        <div>{t-data1}</div>
        <div>{t-data2}</div>
    </div>
</template>
 <!-- Declaration via a template attribute and a (json) source attribute -->
  <list-m
    template="a-template"
    source="./data.json"
  ></list-m>
<!-- OR declaring data within list-m content with header row being a list of ordered property (without the t- prefix) followed by a list of data groups -->
 <list-m template="a-template">
    data1,data2

    data11
    data12

    data21
    data22
</list-m>
<!-- output for both will be the same when using data.json below -->
 <list-m>
    <a-template t-data1="data11" t-data2="data12"></a-template>
    <a-template t-data1="data21" t-data2="data22"></a-template>
 </list-m>
```
data.json
```json
[
    {"data1": "data11", "data2":"data12"},
    {"data2": "data21", "data2":"data22"}
]
```