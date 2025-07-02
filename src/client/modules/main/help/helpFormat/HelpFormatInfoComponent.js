import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const helpText =
`<section class="charlog--pad">
	<p>Info fields such as descriptions, about sections, and rules, may include additional formatting to improve readability and content structure.</p>
</section>

<section class="charlog--pad">
	<h4 class="charlog--pad">No breaking <span class="helpformat--experiment">experimental</span></h4>
	<p class="common--formattext"><code class="charlog--code-inline">&lt;nobr&gt;no break&lt;/nobr&gt;</code> will prevent text from breaking and wrapping at spaces.</p>
</section>

<section class="charlog--pad">
	<h4 class="charlog--pad">Escape <span class="helpformat--experiment">experimental</span></h4>
	<p class="common--formattext"><code class="charlog--code-inline">&lt;esc&gt;_not italic_&lt;/esc&gt;</code> will prevent text to be formatted.</p>
</section>

<section class="charlog--pad">
	<h4 class="charlog--pad">Headers <span class="helpformat--experiment">experimental</span></h4>
	<p>Headers help to improve readability and make a text easier to navigate.</p>
	<p class="common--formattext"><code class="charlog--code-inline"># Header 1</code> at the start of a line will create a large header.</p>
	<p class="common--formattext"><code class="charlog--code-inline">## Header 2</code> at the start of a line will create a medium header.</p>
	<p class="common--formattext"><code class="charlog--code-inline">### Header 3</code> at the start of a line will create a small header.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Header example</h4>
	<div class="charlog--pad">
		<div class="charlog--code">
			<code>set desc = John is a handsome guy.</code><br>
			<code>## Clothes</code><br>
			<code>He wears jeans with a short sleeved shirt.</code><br>
		</div>
	</div>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Sections</h4>
	<p>A section creates a small header with collapsible content.</p>
	<p class="common--formattext"><code class="charlog--code-inline">[[Section title]]</code> alone on a line will create a new section with the content below.</p>
	<p class="common--formattext"><code class="charlog--code-inline">[[Limited section]] { ... }</code> will create a limited section containing the rows enclosed within the {curly brackets}.</p>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Section example</h4>
	<div class="charlog--pad">
		<div class="charlog--code">
			<code>set room desc = The room is empty except for a chest on the floor.</code><br>
			<code>[[Chest]]</code><br>
			<code>It is a worn down wooden chest.</code><br>
			<code>[[Walls]] {</code><br>
			<code>There are scratch marks on the walls.</code><br>
			<code>}</code><br>
			<code>The room has a single door and no windows.</code>
		</div>
	</div>
</section>
<section class="charlog--pad">
	<h4 class="charlog--pad">Tables <span class="helpformat--experiment">experimental</span></h4>
	<p>A table structures text into columns and rows.</p>
	<p class="common--formattext">To add a table, use the vertical line <code class="charlog--code-inline">|</code> to separate each column, and use three or more dashes <code class="charlog--code-inline">---</code> to create each column's header. A vertical line may also be added at the beginning and end of each row.</p>
	<div class="charlog--pad">
		<div class="charlog--code">
			<code>| Item&nbsp; | Price |</code><br>
			<code>| ----- | ----- |</code><br>
			<code>| Pizza | 40c&nbsp;&nbsp; |</code><br>
			<code>| Drink | 10c&nbsp;&nbsp; |</code><br>
		</div>
	</div>
	<p>Results in:</p>
	<div class="charlog--pad">
		<div class="charlog--code common--formattext">
			<table style="margin:0"><thead><tr><th>Item</th><th>Price</th></tr></thead><tbody><tr><td>Pizza</td><td>40c</td></tr><tr><td>Drink</td><td>10c</td></tr></tbody></table>
		</div>
	</div>
	<p>Cell widths can vary; the vertical lines does not have to be aligned.</p>
	<p>If the header row is omitted, the cells in the first column will be styled as headers:
	<div class="charlog--pad">
		<div class="charlog--code">
			<code>--- | ---</code><br>
			<code>No minors | Your character has to be at least 18 to enter the area.</code><br>
			<code>No OOC | You have to remain in character while in the area.</code><br>
		</div>
	</div>
	<p>Results in:</p>
	<div class="charlog--pad">
		<div class="charlog--code common--formattext">
			<table style="margin:0"><tbody>
				<tr>
					<th>No minors</th>
					<td>Your character has to be at least 18 to enter the area.</td>
				</tr>
				<tr>
					<th>No OOC</th>
					<td>You have to remain in character while in the area.</td>
				</tr>
			</tbody></table>
		</div>
	</div>
</section>

<section class="charlog--pad">
	<h4 class="charlog--pad">Text formatting</h4>
	<p>For basic text formatting also available for info fields, type:</p>
	<div class="charlog--pad">
		<div class="charlog--code">
			<code>help format</code><br>
		</div>
	</div>
</section>`;

class HelpFormatInfoComponent extends Html{
	constructor(module) {
		super(l10n.l('helpFormat.helpFormatInfoDesc', helpText), { className: 'helpformat' });
	}
}

export default HelpFormatInfoComponent;
