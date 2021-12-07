import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import * as $ from "jquery";
import { CommonService } from "src/providers/common-service/common.service";

/*



  let value = [{
                value: 'value used for the item (any type i.e string, array or any object)', 
                text: 'text to be displayed (allow only string or number)' 
              }];

  let placehosderName = 'Placeholder name';

  <app-iautocomplete id="FieldId" [Data]="value" (OnSelect)="FireEventOnSelection($event)"
    [Placeholder]="placehosderName" [Defaultvalue]="DefaultData">
  </app-iautocomplete>






*/

@Component({
  selector: "app-iautocomplete",
  templateUrl: "./iautocomplete.component.html",
  styleUrls: ["./iautocomplete.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: IautocompleteComponent,
      multi: true,
    },
  ],
})
export class IautocompleteComponent implements OnInit, ControlValueAccessor {
  SampleData: any;
  BindingData: any = [];
  AutofillDroopdownHeight: any;
  HeightValue: number;
  AutofillObject: any;
  InitValue: string = "";
  InitData: string = "";

  OriginalData: any = null;
  DropdownData: any = null;
  placeholder: string;
  currentValue: string;
  selectedIndex: number = -1;
  element: any;
  el: any;
  suggestions = [];
  badQueries = [];
  intervalId: any;
  cachedResponse = [];
  //onChange: any;
  onChangeInterval: any;
  isLocal: any;
  ignoreValueChange: any;
  suggestionsContainer: any = null;
  options: any;
  classes: any;
  isShowEmptyRow: boolean = false;
  $CurrentAutoComplete: any;
  manualFocus: boolean = false;
  DefaultValue: any = null;
  IsSingleMode: boolean = false;
  hiddenelem: any = null;
  nextTabIndex: number = 0;
  currentTabIndex: number = 0;

  onChange = (quantity) => {};

  onTouched = () => {};

  touched = false;

  disabled = false;


  writeValue(value: any) {
    if (typeof value !== "undefined") {
      this.DefaultValue = value;
      this.BindDefaultValue();
    }
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }


  //@Input() filterByServer: any;
  @Input() ClassName: any;
  @Input() 
  set Tabindex(value: any) {
    if(value) {
      this.currentTabIndex = Number(value);
      this.nextTabIndex = this.currentTabIndex + 1;
    }
  }
  @Output() OnSelect = new EventEmitter();
  @Output() onKeyup = new EventEmitter();
  @Input()
  set SingleMode(mode: string) {
    if (typeof mode !== "undefined") {
      if (mode === "on") {
        this.IsSingleMode = true;
      } else {
        this.IsSingleMode = false;
      }
    }
  }

  @Input()
  set Data(UpdatedData: any) {
    if (typeof UpdatedData !== "undefined") {
      this.DropdownData = UpdatedData;
      this.OriginalData = UpdatedData;
      this.ManageBindingData();
    }
  }

  @Input()
  set Placeholder(PlaceholderText: any) {
    if (typeof PlaceholderText !== "undefined") {
      this.placeholder = PlaceholderText;
    }
  }

  get Data() {
    return this.OriginalData;
  }

  constructor(private commonService: CommonService) {
    this.HeightValue = 250;
    this.AutofillDroopdownHeight = this.HeightValue.toString() + "px";
  }

  BindDefaultValue() {
    if (this.DefaultValue !== null && this.DropdownData) {
      let elems = this.DropdownData.filter(
        (x) => x.value === this.DefaultValue
      );
      if (elems.length === 1) {
        this.InitValue = elems[0].text;
        this.InitData = JSON.stringify(elems[0].value);
      } else if (elems.length > 1) {
      }
    } else {
      this.InitValue = this.placeholder;
      this.InitData = "";
    }
  }

  NoAction() {
    event.stopPropagation();
    event.preventDefault();
  }

  ManageBindingData() {
    if (this.commonService.IsValid(this.DropdownData)) {
      this.BindingData = null;
      this.BindingData = this.DropdownData;
      if (this.$CurrentAutoComplete !== null) {
        this.suggestions = this.commonService.IsValid(this.DropdownData)
          ? this.DropdownData
          : [];
      }

      if (
        typeof this.BindingData !== "undefined" &&
        this.BindingData !== null
      ) {
        if (this.BindingData.length === 0) this.isShowEmptyRow = true;
        else this.isShowEmptyRow = false;
      } else {
        this.isShowEmptyRow = true;
      }
    }
  }

  ngOnInit() {}

  InitialSetup(a, b) {
    var c = function () {},
      cn = {
        autoSelectFirst: !1,
        appendTo: "iautofill-searchfield",
        serviceUrl: null,
        lookup: null,
        onValueSelect: null,
        width: "auto",
        minChars: 1,
        maxHeight: 200,
        deferRequestBy: 0,
        params: {},
        //formatResult: g.formatResult,
        delimiter: null,
        zIndex: 9999,
        type: "GET",
        noCache: !1,
        onSearchStart: c,
        onSearchComplete: c,
        containerClass: "autocomplete-suggestions",
        tabDisabled: !1,
        dataType: "text",
        lookupFilter: function (a, b, c) {
          return -1 !== a.value.toLowerCase().indexOf(c);
        },
        paramName: "query",
        transformResult: function (a) {
          return "string" === typeof a ? $.parseJSON(a) : a;
        },
      };
    this.element = a;
    this.el = $(a);
    this.suggestions = this.commonService.IsValid(b.lookup) ? b.lookup : [];
    this.badQueries = [];
    this.selectedIndex = -1;
    this.currentValue = this.element.value;
    this.intervalId = 0;
    this.cachedResponse = [];
    //this.onChange = this.onChangeInterval = null;
    this.isLocal = this.ignoreValueChange = !1;
    this.suggestionsContainer = $(a)
      .closest('div[name="autofill-container"]')
      .find('div[name="iautofill-div"]')[0];
    this.options = $.extend({}, cn, b);
    this.classes = {
      selected: "autocomplete-selected",
      suggestion: "autocomplete-suggestion",
    };
    this.setOptions(b);
    setTimeout(() => {
      this.moveOnTab();
    }, 100);
  }

  InitAutoComplete() {
    $("#autocomplete").autocomplete({
      lookup: this.BindingData,
      onValueSelect: function (suggestion) {
        var thehtml =
          "<strong>Currency Name:</strong> " +
          suggestion.value +
          " <br> <strong>Symbol:</strong> " +
          suggestion.data;
        $("#outputcontent").html(thehtml);
      },
    });
  }

  ShowAutofillDropdown() {
    let e: any = event.target;
    this.hiddenelem = e.closest("div").querySelector("input[name='autocomplete']");
    if (!this.manualFocus) {
      this.ManageBindingData();
      let $event = $(event.currentTarget).closest(
        'div[name="autofill-container"]'
      );
      $event.find('input[name="autocomplete"]').val("");
      $event.find('div[name="suggestionBox-dv"]').removeClass("d-none");
      this.manualFocus = true;
      $event.find('input[name="autocomplete"]').focus();
      this.$CurrentAutoComplete = $event;
      this.InitialSetup($event.find('input[name="autocomplete"]')[0], {
        lookup: this.BindingData,
        onValueSelect: null,
      });
    } else {
      this.manualFocus = false;
    }
  }

  onKeyPress(a: any) {
    switch (a.keyCode) {
      case 27:
        this.el.val(this.currentValue);
        this.hide();
        break;
      case 9:
        if (-1 === this.selectedIndex) {
          let fulltext = $(event.currentTarget).val();
          this.selectOption({ value: fulltext, data: "" }, -1);
          this.hide();
          return;
        }
        this.select(this.selectedIndex, true);
        break;
      case 13:
        if (-1 === this.selectedIndex) {
          let fulltext = $(event.currentTarget).val();
          this.selectOption({ value: fulltext, data: "" }, -1);
          this.hide();
          return;
        }
        this.select(this.selectedIndex, 13 === a.keyCode);
        if (9 === a.keyCode && !1 === this.options.tabDisabled) return;
        break;
      case 38:
        this.moveUp();
        break;
      case 40:
        this.moveDown();
        break;
      default:
        return;
    }
    a.stopImmediatePropagation();
    a.preventDefault();
  }

  onKeyUp(a: any) {
    var b = this;
    switch (a.keyCode) {
      case 38:
      case 40:
        return;
    }
    clearInterval(b.onChangeInterval);
    if (b.currentValue !== b.el.val())
      if (0 < b.options.deferRequestBy)
        b.onChangeInterval = setInterval(function () {
          b.onValueChange();
        }, b.options.deferRequestBy);
      else {
        // if (this.filterByServer) {
        //   this.currentValue = this.element.value;
        //   a = this.getQuery(this.currentValue);
        //   this.onKeyup.emit(a);
        // } else 
        b.onValueChange();
      }
  }

  onValueChange() {
    var a;
    clearInterval(this.onChangeInterval);
    this.currentValue = this.element.value;
    a = this.getQuery(this.currentValue);
    this.selectedIndex = -1;
    this.ignoreValueChange
      ? (this.ignoreValueChange = !1)
      : a.length < this.options.minChars
      ? (this.BindingData = this.DropdownData)
      : this.getSuggestions(a);
  }

  getSuggestions(a) {
    // make ajax request;
    let Data = this.DropdownData;
    this.BindingData = [];
    let index = 0;
    while (index < Data.length) {
      if (
        Data[index].text !== null &&
        Data[index].text.toLocaleLowerCase().indexOf(a) === 0
      ) {
        this.BindingData.push(Data[index]);
      }
      index++;
    }
  }

  getQuery(a) {
    var b = this.options.delimiter;
    if (!b) return $.trim(a);
    a = a.split(b);
    return $.trim(a[a.length - 1]);
  }

  getSuggestionsLocal(a) {
    var b = a.toLowerCase(),
      c = this.options.lookupFilter;
    return {
      suggestions: $.grep(this.options.lookup, function (d) {
        return c(d, a, b);
      }),
    };
  }

  hide() {
    this.selectedIndex = -1;
    //$(this.suggestionsContainer).hide();
    this.$CurrentAutoComplete.find('input[name="autocomplete"]').val("");
    this.$CurrentAutoComplete
      .find('div[name="suggestionBox-dv"]')
      .addClass("d-none");
  }

  activate(a) {
    var b = this.classes.selected,
      c = $(this.suggestionsContainer),
      d = c.children();
    c.children("." + b).removeClass(b);
    this.selectedIndex = a;
    return -1 !== this.selectedIndex && d.length > this.selectedIndex
      ? ((a = d.get(this.selectedIndex)), $(a).addClass(b), a)
      : null;
  }

  select(a, b) {
    var c = this.BindingData[a];
    c &&
      (this.el.val(c),
      (this.ignoreValueChange = b),
      this.hide(),
      this.onValueSelect(a));
    this.selectOption(c, a);
    this.hiddenelem.focus();
    this.OnSelect.emit(c);
  }

  selectOption(c, a) {
    this.$CurrentAutoComplete
      .find('input[name="iautofill-textfield"]')
      .val(c.text);
    this.$CurrentAutoComplete
      .find('input[name="iautofill-textfield"]')
      .attr("data", JSON.stringify(c));
    this.$CurrentAutoComplete
      .find('div[name="suggestionBox-dv"]')
      .addClass("d-none");
  
    this.onChange(c.value);

    if (this.IsSingleMode) {
      let index = 0;
      while (index < this.BindingData.length) {
        if (this.BindingData[index].value === c.value) {
          this.BindingData.splice(index, 1);
        }
        index++;
      }
      this.ToggleRemoveIcon(JSON.stringify(c), false);
    }
  }

  AddToAutoFillList() {
    this.$CurrentAutoComplete = $(event.currentTarget).closest("div");
    this.ToggleRemoveIcon($(event.currentTarget).attr("data"), true);
    this.ClearSelection();
  }

  ToggleRemoveIcon(JsonData: string, IsAddtoList: boolean) {
    let $item = this.$CurrentAutoComplete.find('a[name="remove-pointer"]');
    $item.toggleClass("d-none");
    $item.attr("data", JsonData);
    if (IsAddtoList) {
      let Item = JSON.parse(JsonData);
      this.BindingData.unshift(Item);
    }
  }

  ClearSelection() {
    let elem = this.$CurrentAutoComplete.find(
      'input[name="iautofill-textfield"]'
    );
    if (elem !== null) {
      elem.val("");
      elem.attr("data", "");
      this.InitData = "";
    }
  }

  moveUp() {
    -1 !== this.selectedIndex &&
      (0 === this.selectedIndex
        ? ($(this.suggestionsContainer)
            .children()
            .first()
            .removeClass(this.classes.selected),
          (this.selectedIndex = -1),
          this.el.val(this.currentValue))
        : this.adjustScroll(this.selectedIndex - 1));
  }

  moveDown() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.adjustScroll(this.selectedIndex + 1);
  }

  moveOnTab() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.EnableFieldOnTab(this.selectedIndex + 1);
  }

  EnableFieldOnTab(a) {
    var b = this.activate(a);
  }

  adjustScroll(a) {
    var b = this.activate(a),
      c,
      d;
    b &&
      ((b = b.offsetTop),
      (c = $(this.suggestionsContainer).scrollTop()),
      (d = c + this.options.maxHeight - 25),
      b < c
        ? $(this.suggestionsContainer).scrollTop(b)
        : b > d &&
          $(this.suggestionsContainer).scrollTop(
            b - this.options.maxHeight + 32
          ),
      this.el.val(this.getValue(this.BindingData[a].text)));
  }

  onValueSelect(a) {
    var b = this.options.onValueSelect;
    a = this.BindingData[a];
    this.el.val(this.getValue(a.value));
    $.isFunction(b) && b.call(this.element, a);
  }

  getValue(a) {
    var b = this.options.delimiter,
      c;
    if (!b) return a;
    c = this.currentValue;
    b = c.split(b);
    return 1 === b.length
      ? a
      : c.substr(0, c.length - b[b.length - 1].length) + a;
  }

  dispose() {
    this.el.off(".autocomplete").removeData("autocomplete");
    this.disableKillerFn();
    $(this.suggestionsContainer).remove();
  }

  onBlur() {
    this.hide();
    this.killSuggestions();
  }

  setOptions(a) {
    var b = this.options;
    var h = {
      extend: function (a, b) {
        return $.extend(a, b);
      },
      createNode: function (a) {
        var b = document.createElement("div");
        b.innerHTML = a;
        return b.firstChild;
      },
    };
    h.extend(b, a);
    if ((this.isLocal = $.isArray(b.lookup)))
      b.lookup = this.verifySuggestionsFormat(b.lookup);
    $(this.suggestionsContainer).css({
      "max-height": b.maxHeight + "px",
      width: b.width + "px",
      "z-index": b.zIndex,
    });
  }

  verifySuggestionsFormat(a) {
    return a.length && "string" === typeof a[0]
      ? $.map(a, function (a) {
          return {
            value: a,
            data: null,
          };
        })
      : a;
  }

  clearCache() {
    this.cachedResponse = [];
    this.badQueries = [];
  }

  clear() {
    this.clearCache();
    this.currentValue = null;
    this.suggestions = [];
  }

  fixPosition() {
    let a: any;
    "body" === this.options.appendTo &&
      ((a = this.el.offset()),
      $(this.suggestionsContainer).css({
        top: a.top + this.el.outerHeight() + "px",
        left: a.left + "px",
      }));
  }

  enableKillerFn() {
    $(document).on("click.autocomplete", this.killerFn);
  }

  disableKillerFn() {
    $(document).off("click.autocomplete", this.killerFn);
  }

  killerFn(b) {
    0 === $(b.target).closest("." + this.options.containerClass).length &&
      (this.killSuggestions(), this.disableKillerFn());
  }

  killSuggestions() {
    let a: any = this;
    a.stopKillSuggestions();
    a.intervalId = window.setInterval(function () {
      a.hide();
      a.stopKillSuggestions();
    }, 300);
  }

  stopKillSuggestions() {
    window.clearInterval(this.intervalId);
  }
}
