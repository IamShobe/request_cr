
export const getVars = () => {
  const header = document.querySelector('#partial-discussion-header');
  const branches = header.querySelectorAll('.commit-ref');
  const branchName = branches[1]?.innerText.trim();
  const branchToName = branches[0]?.innerText.trim();
  const repo = document.querySelector('a[data-pjax="#js-repo-pjax-container"]')?.innerHTML.trim();
  const author = document.querySelector('span[itemprop="author"]')?.textContent.trim();
  const fullName = `${author}/${repo}`;
  const PRtitle = document.querySelector('.js-issue-title')?.innerHTML.trim();
  const url = window.location;
  const description = document.querySelector('meta[name="twitter:description"]').content
  const fullDescription = document.querySelector('meta[name="description"]').content
  const rawSubjectTag = document.querySelector('meta[name="hovercard-subject-tag"]').content
  const prID = rawSubjectTag.match(/pull_request:([0-9]+)/)?.[1]

  return {branchName, branchToName, repo, PRtitle, url, prID, description, fullDescription, author, fullName};
}

