# ASCII-only builder -> professional .docx (cover page + styled body). PS 5.1 safe.
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8 = New-Object System.Text.UTF8Encoding($false)

$json = [System.IO.File]::ReadAllText((Join-Path $here "manual-content.json"), [System.Text.Encoding]::UTF8)
$blocks = $json | ConvertFrom-Json

function Esc([string]$s) {
  if ($null -eq $s) { return "" }
  $s = $s -replace '&', '&amp;'; $s = $s -replace '<', '&lt;'; $s = $s -replace '>', '&gt;'; $s = $s -replace '"', '&quot;'
  return $s
}
$sb = New-Object System.Text.StringBuilder
function Add([string]$x) { [void]$script:sb.Append($x) }
function Run([string]$t,[bool]$b=$false,[string]$col=$null,[int]$sz=0){
  $rpr=""
  if($b -or $col -or $sz){ $rpr="<w:rPr>"; if($b){$rpr+="<w:b/>"}; if($col){$rpr+="<w:color w:val=`"$col`"/>"}; if($sz){$rpr+="<w:sz w:val=`"$sz`"/><w:szCs w:val=`"$sz`"/>"}; $rpr+="</w:rPr>" }
  return "<w:r>$rpr<w:t xml:space=`"preserve`">"+(Esc $t)+"</w:t></w:r>"
}
function P([string]$t){ Add ("<w:p>"+(Run $t)+"</w:p>") }
function Heading($style,$t){ Add ("<w:p><w:pPr><w:pStyle w:val=`"$style`"/></w:pPr>"+(Run $t)+"</w:p>") }
function Bullet($t){ Add ("<w:p><w:pPr><w:ind w:left=`"360`" w:hanging=`"200`"/><w:spacing w:after=`"40`"/></w:pPr>"+(Run ([char]0x30FB+$t))+"</w:p>") }
function Label($l,$t){ Add ("<w:p><w:pPr><w:spacing w:after=`"60`"/><w:ind w:left=`"360`" w:hanging=`"200`"/></w:pPr>"+(Run ([char]0x30FB+$l) $true)+(Run $t)+"</w:p>") }
function StepP($n,$t){ Add ("<w:p><w:pPr><w:spacing w:after=`"60`"/><w:ind w:left=`"460`" w:hanging=`"460`"/></w:pPr>"+(Run ("STEP "+$n+"  ") $true "1F2A44")+(Run $t)+"</w:p>") }
function QA($q,$a){ Add ("<w:p><w:pPr><w:spacing w:before=`"100`" w:after=`"20`"/></w:pPr>"+(Run $q $true "1F2A44")+"</w:p>"); Add ("<w:p><w:pPr><w:spacing w:after=`"60`"/></w:pPr>"+(Run $a)+"</w:p>") }
function Note($t){
  $ppr="<w:pPr><w:pBdr><w:left w:val=`"single`" w:sz=`"18`" w:space=`"6`" w:color=`"C9A227`"/></w:pBdr><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"FCF6E6`"/><w:spacing w:before=`"80`" w:after=`"80`"/><w:ind w:left=`"180`"/></w:pPr>"
  Add ("<w:p>$ppr"+(Run "POINT  " $true "9A7B0A")+(Run $t)+"</w:p>")
}
function Flow($steps){
  for($i=0;$i -lt $steps.Count;$i++){
    $ppr="<w:pPr><w:jc w:val=`"center`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"EEF2F8`"/><w:spacing w:before=`"30`" w:after=`"30`"/><w:ind w:left=`"800`" w:right=`"800`"/></w:pPr>"
    Add ("<w:p>$ppr"+(Run $steps[$i] $true)+"</w:p>")
    if($i -lt $steps.Count-1){ Add ("<w:p><w:pPr><w:jc w:val=`"center`"/><w:spacing w:before=`"0`" w:after=`"0`"/></w:pPr>"+(Run ([char]0x2193) $true "C9A227")+"</w:p>") }
  }
  Add "<w:p/>"
}
function Table($headers,$rows,$widths){
  $grid=""; foreach($w in $widths){ $grid+="<w:gridCol w:w=`"$w`"/>" }
  Add ("<w:tbl><w:tblPr><w:tblStyle w:val=`"TableGrid`"/><w:tblW w:w=`"0`" w:type=`"auto`"/></w:tblPr><w:tblGrid>$grid</w:tblGrid>")
  Add "<w:tr>"
  for($i=0;$i -lt $headers.Count;$i++){
    $tcpr="<w:tcPr><w:tcW w:w=`"$($widths[$i])`" w:type=`"dxa`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"1F2A44`"/><w:vAlign w:val=`"center`"/></w:tcPr>"
    Add ("<w:tc>$tcpr<w:p><w:pPr><w:spacing w:before=`"40`" w:after=`"40`"/></w:pPr>"+(Run $headers[$i] $true "FFFFFF")+"</w:p></w:tc>")
  }
  Add "</w:tr>"
  $alt=$false
  foreach($row in $rows){
    Add "<w:tr>"
    for($i=0;$i -lt $row.Count;$i++){
      $fill= if($alt){"F4F6FA"}else{"FFFFFF"}
      $tcpr="<w:tcPr><w:tcW w:w=`"$($widths[$i])`" w:type=`"dxa`"/><w:shd w:val=`"clear`" w:color=`"auto`" w:fill=`"$fill`"/><w:vAlign w:val=`"center`"/></w:tcPr>"
      Add ("<w:tc>$tcpr<w:p><w:pPr><w:spacing w:before=`"40`" w:after=`"40`"/></w:pPr>"+(Run $row[$i])+"</w:p></w:tc>")
    }
    Add "</w:tr>"; $alt=-not $alt
  }
  Add "</w:tbl><w:p/>"
}

# ---- cover page ----
Add "<w:p><w:pPr><w:spacing w:before=`"2200`" w:after=`"0`"/><w:jc w:val=`"center`"/></w:pPr>"
Add (Run "TAX STRATEGY LAB" $true "C9A227" 30)
Add "</w:p>"

foreach($b in $blocks){
  switch($b.type){
    "cover_title" { } # already rendered
    "cover_sub"   { Add ("<w:p><w:pPr><w:jc w:val=`"center`"/><w:spacing w:before=`"120`" w:after=`"0`"/></w:pPr>"+(Run $b.text $true "1F2A44" 44)+"</w:p>") }
    "cover_meta"  {
      Add ("<w:p><w:pPr><w:jc w:val=`"center`"/><w:spacing w:before=`"200`" w:after=`"0`"/></w:pPr>"+(Run $b.text $false "6B7280" 20)+"</w:p>")
      Add "<w:p><w:pPr><w:spacing w:before=`"0`" w:after=`"0`"/></w:pPr><w:r><w:br w:type=`"page`"/></w:r></w:p>"
    }
    "h1"     { Heading "Heading1" $b.text }
    "p"      { P $b.text }
    "bullet" { Bullet $b.text }
    "label"  { Label $b.label $b.text }
    "step"   { StepP $b.n $b.text }
    "qa"     { QA $b.q $b.a }
    "note"   { Note $b.text }
    "flow"   { Flow $b.steps }
    "table"  { Table $b.headers $b.rows $b.widths }
    default  { P $b.text }
  }
}

$body=$sb.ToString()
$sect="<w:sectPr><w:pgSz w:w=`"11906`" w:h=`"16838`"/><w:pgMar w:top=`"1440`" w:right=`"1440`" w:bottom=`"1440`" w:left=`"1440`" w:header=`"720`" w:footer=`"680`"/></w:sectPr>"
$documentXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
 '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+$body+$sect+'</w:body></w:document>'

$ja="Yu Gothic"
$stylesXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
'<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'+
"<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii=`"$ja`" w:eastAsia=`"$ja`" w:hAnsi=`"$ja`" w:cs=`"$ja`"/><w:sz w:val=`"21`"/><w:szCs w:val=`"21`"/></w:rPr></w:rPrDefault></w:docDefaults>"+
'<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:style>'+
"<w:style w:type=`"paragraph`" w:styleId=`"Heading1`"><w:name w:val=`"heading 1`"/><w:basedOn w:val=`"Normal`"/><w:pPr><w:keepNext/><w:spacing w:before=`"300`" w:after=`"140`"/><w:pBdr><w:bottom w:val=`"single`" w:sz=`"8`" w:space=`"4`" w:color=`"C9A227`"/></w:pBdr></w:pPr><w:rPr><w:b/><w:color w:val=`"1F2A44`"/><w:sz w:val=`"28`"/><w:szCs w:val=`"28`"/></w:rPr></w:style>"+
'<w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="C7CDD6"/><w:left w:val="single" w:sz="4" w:space="0" w:color="C7CDD6"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="C7CDD6"/><w:right w:val="single" w:sz="4" w:space="0" w:color="C7CDD6"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="C7CDD6"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="C7CDD6"/></w:tblBorders></w:tblPr></w:style>'+
'</w:styles>'

# footer with page number
$footerXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
'<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="9AA3B2"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">TAX STRATEGY LAB  Operation Manual  -  </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>'

$contentTypes='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
'<Default Extension="xml" ContentType="application/xml"/>'+
'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'+
'<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'+
'<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'+
'</Types>'
$rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
$docRels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'+
'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>'

# attach footer ref to section
$documentXml = $documentXml -replace '<w:sectPr>', '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/>'
$documentXml = $documentXml -replace 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">', 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'

$outPath = Join-Path $here "TAX_STRATEGY_LAB_Operation_Manual_v2.docx"
if (Test-Path $outPath) { Remove-Item $outPath -Force }
Add-Type -AssemblyName System.IO.Compression | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem | Out-Null
$zip=[System.IO.Compression.ZipFile]::Open($outPath,[System.IO.Compression.ZipArchiveMode]::Create)
function AddEntry($zip,$name,$content,$enc){ $e=$zip.CreateEntry($name,[System.IO.Compression.CompressionLevel]::Optimal); $st=$e.Open(); $by=$enc.GetBytes($content); $st.Write($by,0,$by.Length); $st.Close() }
AddEntry $zip "[Content_Types].xml" $contentTypes $utf8
AddEntry $zip "_rels/.rels" $rels $utf8
AddEntry $zip "word/document.xml" $documentXml $utf8
AddEntry $zip "word/styles.xml" $stylesXml $utf8
AddEntry $zip "word/footer1.xml" $footerXml $utf8
AddEntry $zip "word/_rels/document.xml.rels" $docRels $utf8
$zip.Dispose()
Write-Output ("WROTE: "+$outPath)
Write-Output ("SIZE: "+(Get-Item $outPath).Length+" bytes")
Write-Output ("BLOCKS: "+$blocks.Count)
