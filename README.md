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
<!-- output using data.json below -->
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
### Source can be also an embedded json

```html
  <script type="application/json" id="embedded-data">
      [
          {
              "id": 1,
              "name": "ename1"
          },
          {
              "id": 2,
              "name": "ename2"
          }
      ]
  </script>
 <list-m
    template="a-template"
    source="embedded-data"
 ></list-m>
```

## level-up attribute

Boolean `level-up` attribute allows to replace a freshly (ghost) `list-m` custom-element by its children allowing to layout those children with former `list-m` siblings

```javascript
 <list-m
    template="a-template"
    source="embedded-data"
    level-up
 ></list-m>
```

