# layout-m

 `layout-m` is a custom element for grouping `template` instances
 - to layout them
 - to be part of its parent layout with `level-up` attribute

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
 <!-- Declaration via a template attribute and a (json) source attribute -->
  <!-- Source can be
   - an url to be fetched, eg: ./data.json
   - an id referencing an application/json script, eg: #data
   -->
  <layout-m
    template="a-card"
    source="#data"
  ></layout-m>
<script type="application/json" id="data">
  [
    {
      "name": "Leila Sunflower",
      "job": "Soil Mender"
    },
    {
      "name": "John Green",
      "job": "Industry Mender"
    }
  ]
</script>
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

