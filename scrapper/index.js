import { launch } from "puppeteer"
import { stat, writeFile } from 'node:fs/promises'

const articleLinks = `
animais/2019/09/martina-panisi-protege-caracois-gigantes-em-sao-tome-e-principe
animais/2019/10/goncalo-costa-luta-pela-conservacao-de-cigarras-em-marrocos
animais/2021/02/entrevista-goncalo-curveira-santos-carnivoros-gestao-conservacao
animais/2021/02/entrevista-joana-pereira-conservacao-da-vida-selvagem
animais/2021/07/entrevista-nuno-queiroz-tubarao-anequim-devia-ter-uma-quota-pesca-zero
changing-tomorrow-now/2021/12/a-grande-aposta-na-producao-de-energia-offshore
changing-tomorrow-now/2021/12/as-estrategias-da-edp-para-cumprir-ambicoes-cop26
changing-tomorrow-now/2021/12/estamos-a-viver-decada-decisiva-para-o-planeta
changing-tomorrow-now/2021/12/o-cunho-da-edp-na-transicao-energetica-rumo-a-peninsula-iberica-mais-verde
changing-tomorrow-now/2021/12/o-papel-da-edp-na-protecao-do-planeta
changing-tomorrow-now/2021/12/para-um-futuro-mais-sustentavel-nao-ha-mudanca-sem-um-esforco-conjunto
ciencia/2018/08/sylvia-earle-rainha-dos-oceanos
ciencia/2018/09/nova-planta-fossil-descoberta-em-sao-pedro-da-cova
ciencia/2018/11/entrevista-a-miguel-stanley
ciencia/2018/11/entrevista-a-trudi-trueit-autora-da-saga-explorer-academy
ciencia/2019/04/cibio-marca-historia-da-ciencia-em-portugal
ciencia/2019/04/explorer-academy-a-pena-do-falcao
ciencia/2019/04/projeto-com-cunho-portugues-ajuda-abelhas-a-comunicar-com-peixes
ciencia/2019/05/nova-especie-de-planta-fossil-descoberta-na-regiao-do-douro
ciencia/2019/06/sabia-que-25-dos-acidentes-estao-relacionados-com-problemas-visuais
ciencia/2019/09/fossil-de-primitiva-barata-parasitoide-descoberto-na-regiao-do-douro
ciencia/2019/12/conhece-bolsas-da-national-geographic-society
ciencia/2019/12/descoberto-importante-tesouro-natural-no-estuario-do-sado
ciencia/2020/02/entrevista-a-zita-martins-a-primeira-astrobiologa-portuguesa
ciencia/2020/03/entrevista-ann-druyan-produtora-de-cosmos-mundos-possiveis
ciencia/2020/05/cientistas-portugueses-e-canadianos-revelam-como-supercontinente-pangeia-se-formou
ciencia/2020/07/paleontologos-portugueses-descobrem-fossil-bizarro-de-crinoide-na-peninsula-iberica
ciencia/2020/10/descoberta-especie-de-cavalinha-com-cerca-de-300-milhoes-de-anos-na-regiao-do-douro
ciencia/2021/01/gigantes-cosmicos-dao-pontape-de-saida-a-nova-era-na-astronomia
ciencia/2021/01/por-que-razao-ainda-nao-estamos-obcecados-com-o-sono
ciencia/2021/01/socos-no-oceano-de-polvos
ciencia/2021/02/covid19-entrevista-pedro-simas
ciencia/2021/02/neurohacking-como-e-possivel-hackear-o-cerebro-humano
ciencia/2021/02/paleontologo-descobre-fossil-com-mais-de-300-milhoes-de-anos-na-bacia-carbonifera-do-douro
ciencia/2021/08/cientistas-revelam-como-a-alteracao-da-distribuicao-dos-carvalhos-ibericos-no-passado-ajuda-a-prever-variacoes-futuras
ciencia/2021/09/como-a-ciencia-e-a-tecnologia-das-cores-podem-ajudar-a-melhorar-o-equilibrio-emocional
ciencia/2021/09/entrevista-ricardo-rocha-diversidade-racial-etnica-ciencia-portuguesa
ciencia/2022/03/entrevista-ana-cadete-pires
ciencia/2022/05/entrevista-dominique-goncalves
ciencia/2022/06/fossil-de-gafanhoto-primitivo-descoberto-em-sao-pedro-da-cova
ciencia/2022/07/origem-do-sangue-quente-nos-mamiferos-descoberta-por-ricardo-araujo
ciencia/2022/08/algumas-das-ultimas-inovacoes-cientificas-desenvolvidas-em-portugal
ciencia/2022/08/criados-ovos-de-origem-vegetal-portugueses-e-que-substituem-os-ovos-de-galinha
ciencia/2022/08/descobertas-mais-pegadas-de-dinossaurios-no-cabo-espichel
ciencia/2022/10/fertilidade-masculina-papel-dieta-estilo-de-vida
espaco/2018/11/10-coisas-incriveis-sobre-marte
espaco/2018/11/7-desafios-da-vida-humana-em-marte
exploracao/2019/02/por-sua-causa-nossa-existe
exploracao/2019/02/spark-historias-inspiradoras-dos-nossos-exploradores
familia/2021/04/como-o-dinheiro-afeta-as-nossas-relacoes-e-dicas-para-poupar
familia/2022/08/a-narrativa-das-criancas-em-campos-de-refugiados
fotografia/2018/08/timothy-allen-um-zoologo-apaixonado-por-povos-indigenas
fotografia/2018/09/matthieu-paley-vem-diretamente-de-uma-caravana-em-portugal-para-o-exodus
fotografia/2018/09/mike-e-lilliana-libecki-pai-e-filha-exploram-o-mundo
fotografia/2018/11/yann-arthus-bertrand-e-a-personalidade-exodus-2018-e-vem-a-portugal
fotografia/2019/01/as-palavras-de-william-albert-allard-o-fotografo-lendario
fotografia/2019/09/david-chancellor-uma-lente-selvatica-no-exodus7
fotografia/2019/10/entrevista-matthieu-paley-o-fotografo-do-mundo-vive-em-portugal
fotografia/2019/12/entrevista-justin-mott-fundador-de-kindred-guardians
fotografia/2021/04/jamaika-visao-imersiva-de-uma-realidade-por-jose-sarmento-matos
fotografia/2021/05/entrevista-ao-fotojornalista-jose-sarmento-matos
fotografia/2022/05/entrevista-david-doubilet-e-jennifer-hayes
fotografia/2022/05/projeto-documental-de-bernardo-conde-valoriza-a-diversidade-humana
fotografia/benjamin-von-wong-de-engenheiro-de-minas-a-fotografo
fotografia/entrevista-a-eduardo-leal-historias-do-fotografo-documental
historia/2019/04/jane-goodall-celebra-85-anos-a-vida-da-mulher-que-revolucionou-o-estudo-dos-chimpanzes-selvagens
historia/2019/10/130-anos-de-descobertas-aventura-e-exploracao
historia/2020/01/6-museus-portugueses-para-visitar-em-2020
historia/2020/01/the-cave-chega-ao-national-geographic-antes-dos-oscares
historia/2020/02/navio-escola-sagres-reedita-viagem-de-fernao-de-magalhaes
historia/2021/10/joao-zilhao-aquilo-que-nos-vemos-do-passado-e-uma-infima-parte-do-que-existiu
meio-ambiente/2018/08/o-dia-da-sobrecarga-da-terra-1-de-agosto-de-2018
meio-ambiente/2018/11/a-invasao-do-plastico-narrada-por-charles-moore-em-lisboa
meio-ambiente/2019/03/cinco-historias-otimistas-na-climate-change-leadership
meio-ambiente/2019/03/entrevista-a-afroz-shah-responsavel-pela-maior-limpeza-de-praia-do-mundo
meio-ambiente/2019/03/especialistas-partilham-solucoes-para-mitigar-alteracoes-climaticas
meio-ambiente/2019/03/projeto-guardias-do-mar-financiado-com-bolsa-da-national-geographic
meio-ambiente/2019/05/protetor-solar-um-grande-poluidor-dos-oceanos
meio-ambiente/2019/10/diana-rodrigues-estuda-poluicao-por-microplasticos-no-sado-e-mar-da-arrabida
meio-ambiente/2021/02/entrevista-violeta-lapa
meio-ambiente/2021/03/entrevista-danielle-da-silva
meio-ambiente/2021/09/20-sugestoes-para-reduzir-os-descartaveis-em-casa
meio-ambiente/2021/09/como-comer-de-forma-mais-sustentavel-e-saudavel
meio-ambiente/2021/09/habitos-para-reduzir-o-consumo-de-agua-em-casa
meio-ambiente/2021/10/10-dicas-para-reduzir-o-desperdicio-alimentar-em-casa
meio-ambiente/2021/10/como-poupar-energia-em-casa-de-forma-eficaz
meio-ambiente/2021/10/como-reduzir-os-consumos-de-arrefecimento-e-aquecimento-em-casa
meio-ambiente/2022/03/esta-regiao-portuguesa-outrora-abandonada-esta-a-ser-renaturalizada
national-geographic-summit/2019/03/brian-skerry-a-voz-da-conservacao-marinha
national-geographic-summit/2019/03/jamie-butterworth-a-voz-da-economia-circular
national-geographic-summit/2019/03/lucy-hawkes-a-voz-do-mundo-animal
national-geographic-summit/2019/03/paula-sobral-a-voz-do-microplastico
national-geographic-summit/2019/04/claire-sancelot-a-voz-do-desperdicio-zero
photo-ark/o-homem-por-tras-da-arca-entrevista-a-joel-sartore
televisao-e-video/2020/10/um-olhar-feminino-sobre-a-rota-do-trafico
televisao-e-video/2021/12/mariana-van-zeller-pandemia-tem-causado-uma-explosao-mercados-negros
tubarao/2019/05/uma-nova-perspetiva-dos-tubaroes-entrevista-a-brian-skerry
viagem-e-aventuras/2019/03/entrevista-aos-dois-portugueses-premiados-em-free-solo
viagem-e-aventuras/2019/08/como-ultrapassar-a-hodofobia-o-medo-de-viajar
viagem-e-aventuras/2019/08/entrevista-a-patricia-mamona-a-melhor-atleta-portuguesa-de-triplo-salto
viagem-e-aventuras/2019/08/entrevista-joao-garcia-20-anos-apos-o-evereste
viagem-e-aventuras/2019/08/sketching-por-caminhos-portugueses
viagem-e-aventuras/2019/09/entrevista-ao-tarzan-portugues-antonio-pestana-drumond
viagem-e-aventuras/2019/12/faca-uma-roadtrip-em-portugal-como-esta
viagem-e-aventuras/2020/01/entrevista-bernardo-conde-da-engenharia-lider-de-viagens
viagem-e-aventuras/2021/04/da-quimera-ao-dubai
viagem-e-aventuras/2021/04/da-quimera-ao-dubai
viagem-e-aventuras/2021/06/7-atividades-no-destino-de-natureza-mais-radical-de-portugal
viagem-e-aventuras/2021/12/andre-rocha-caminhada-costa-continental-portuguesa
viagem-e-aventuras/2022/05/entrevista-dwayne-fields
viagem-e-aventuras/2022/06/20-dicas-para-fazer-uma-mala-de-viagem-mais-sustentavel
viagem-e-aventuras/2022/06/a-nova-moda-turismo-lento
viagem-e-aventuras/2022/06/como-ter-uma-alimentacao-mais-consciente-em-viagem
viagem-e-aventuras/2022/06/como-viajar-de-forma-mais-leve-e-sustentavel
viagem-e-aventuras/2022/06/descubra-como-criar-impacto-positivo-por-onde-viajou
viagem-e-aventuras/2022/06/descubra-como-fazer-uma-viagem-com-menos-impacto-e-mais-consciente
viagem-e-aventuras/2022/06/sera-este-trilho-na-madeira-a-proxima-grande-rota-portuguesa
viagem-e-aventuras/2022/07/adora-queijo-e-trilhos-descubra-onde-tem-de-ir
viagem-e-aventuras/2022/09/entrevista-carlos-santos
`.trim().split('\n').map(s => s.trim())

const browser = await launch({
  //headless: false,
  defaultViewport: {
    height: 16000,
    width: 1920,
  }
})

const page = (await browser.pages())[0] || (await browser.newPage())
function jsonify(el) {
  if (el instanceof Text) return el.data
  const result = { tag: el.tagName?.toUpperCase() }
  if (result.tag === 'BR') return '\n\n'
  if (result.tag === 'SVG') return el.outerHTML
  for (const key of ['src', 'href', 'alt', 'className', 'ariaLabel', 'media', 'srcset', 'type']) {
    const value = el[key]
    value == null || value == '' || (result[key] = value)
  }
  el.childNodes.length && (result.children = [...el.childNodes].map(jsonify))
  return result
}
let cookieRejected = false
for (const link of articleLinks) {
  const filename = link.toLowerCase().replace(/[^a-z0-1]+/g, '_') + '.json'
  const filestat = await stat(filename).catch(err => err)
  if (filestat?.code !== 'ENOENT') {
    if (filestat instanceof Error) throw filestat
    console.log(filename, 'present')
    continue
  }
  await page.goto(`https://www.natgeo.pt/${link}`, {
    waitUntil: "networkidle2"
  })

  if (!cookieRejected) {
    await page.waitForSelector('#onetrust-reject-all-handler')
    await page.click('#onetrust-reject-all-handler')
    cookieRejected = true
  }

  // find the article element:
  const article = await page.$('#main-content')

  const data = await article.evaluate(jsonify)

  await writeFile(filename, JSON.stringify(data), 'utf8')
  console.log(filename, 'done')
}
