# layout-m

 `layout-m` is a custom element for grouping `template` instances
 - to layout them
 - to let its children to be part of its parent layout with `level-up` attribute

Templates follow the rules from [@titsoft/dry-html](https://github.com/thipages/dry-html)

## Example

```html
<template id="a-card">
  <div class="card">
    <img src="https://placehold.jp/200x200.png" alt="Avatar">
    <div class="container">
        <p><b>{t-name}</b></p> 
        <p>{t-job}</p> 
    </div>
  </div>
</template>
 <!-- Declaration via
  - a template attribute
  - a (json) source attribute either
     - a file or url to be fetched, eg: ./data.json or https://my-api/my-data
     - an id referencing an application/json script, eg: #data
  - an optional root attribute which offsets the array
  - any t-* that needs a non root path
-->
  <layout-m
    template="a-card"
    source="https://my-api/my-data"
    root="records"
    t-id="job.id"
  ></layout-m>
```
with such a json input
```json
  {
    "records": [
      {
        "name": "Leila Sunflower",
        "job": {
          "id": 1,
          "name": "Soil Mender"
        }
      },
      {
        "name": "John Green",
        "job": {
          "id": 2,
          "name": "Industry Mender"
        }
      }
    ]
  }
```

## level-up attribute

Boolean `level-up` attribute allows to replace a transient `layout-m` custom-element by its children allowing to layout those children with former `layout-m` siblings

```javascript
 <layout-m
    template="a-template"
    source="#data"
    level-up
 ></layout-m>
```

